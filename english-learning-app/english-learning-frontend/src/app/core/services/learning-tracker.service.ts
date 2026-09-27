import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface LearningSession {
  id: string;
  user: string;
  skill: string;
  lessonId?: string;
  lessonTitle?: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  isActive: boolean;
  durationMinutes?: number;
}

export interface LearningStats {
  totalMinutes: number;
  streakDays: number;
  todayMinutes: number;
  weeklyMinutes: number;
  avgDailyMinutes: number;
  skillStats: SkillStat[];
  recentSessions: LearningSession[];
  activityChartData: ActivityChartData[];
  completedLessons: number;
  totalLessons: number;
}

export interface SkillStat {
  skill: string;
  minutes: number;
  sessions: number;
  percent: number;
}

export interface ActivityChartData {
  label: string;
  minutes: number;
  percent: number;
  isToday: boolean;
  isFuture: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LearningTrackerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  
  private currentSession: LearningSession | null = null;
  private heartbeatInterval: any;
  private activityListenersBound = false;
  private unloadListenersBound = false;
  private lastActivityTime = Date.now();
  private lastTickTime = Date.now();
  private activeSeconds = 0;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 giây
  private readonly INACTIVE_THRESHOLD = 120000; // 2 phút không hoạt động = pause
  private readonly MAX_SESSION_DURATION = 3600000; // 1 giờ max
  
  private sessionSubject = new Subject<LearningSession | null>();
  session$ = this.sessionSubject.asObservable();

  private statsSubject = new Subject<any>();
  stats$ = this.statsSubject.asObservable();

  // Map route to skill
  private readonly routeToSkill: Record<string, string> = {
    '/vocabulary': 'vocabulary',
    '/vocabulary/': 'vocabulary',
    '/grammar': 'grammar',
    '/grammar/': 'grammar',
    '/listening': 'listening',
    '/listening/': 'listening',
    '/reading': 'reading',
    '/reading/': 'reading',
    '/speaking': 'speaking',
    '/speaking/': 'speaking',
    '/writing': 'writing',
    '/writing/': 'writing',
    '/reading/shadowing': 'reading',
    '/reading/shadowing/': 'reading',
    '/reading/dictation': 'reading',
    '/reading/dictation/': 'reading',
    '/listening/detail': 'listening',
    '/listening/detail/': 'listening',
    '/vocabulary/detail': 'vocabulary',
    '/vocabulary/detail/': 'vocabulary',
    '/grammar/detail': 'grammar',
    '/grammar/detail/': 'grammar'
  };

  constructor() {}

  /**
   * Khởi động tracking khi vào trang học
   */
  startTracking(skill: string, lessonId?: string, lessonTitle?: string): void {
    // Nếu đã có session cùng skill, không tạo mới
    if (this.currentSession && this.currentSession.skill === skill && this.currentSession.isActive) {
      return;
    }

    // Kết thúc session cũ nếu khác skill
    if (this.currentSession && this.currentSession.isActive) {
      this.endSession().subscribe();
    }

    this.startSession(skill, lessonId, lessonTitle);
    this.bindActivityListeners();
    this.startHeartbeat();
  }

  /**
   * Bắt đầu session mới
   */
  private startSession(skill: string, lessonId?: string, lessonTitle?: string): void {
    this.authService.startLearningSession(skill, lessonId, lessonTitle).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentSession = {
            ...res.data,
            startedAt: new Date(res.data.startedAt),
            endedAt: res.data.endedAt ? new Date(res.data.endedAt) : undefined
          };
          this.activeSeconds = 0;
          this.lastTickTime = Date.now();
          this.lastActivityTime = Date.now();
          this.bindUnloadListeners();
          this.sessionSubject.next(this.currentSession);
        }
      },
      error: (err) => console.error('Failed to start learning session:', err)
    });
  }

  /**
   * Kết thúc session hiện tại
   */
  endSession(): Observable<any> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return new Observable(observer => observer.complete());
    }

    this.unbindActivityListeners();
    this.unbindUnloadListeners();
    this.stopHeartbeat();
    this.flushActiveDelta();

    const skill = this.currentSession.skill;
    const seconds = Math.min(3600, Math.floor(this.activeSeconds));

    return new Observable(observer => {
      this.authService.endLearningSession(skill, seconds).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const durationMinutes = res.data.durationMinutes || Math.round(this.currentSession!.durationSeconds / 60);
            this.currentSession = {
              ...this.currentSession!,
              endedAt: new Date(res.data.endedAt),
              durationSeconds: res.data.durationSeconds || this.currentSession!.durationSeconds,
              isActive: false,
              durationMinutes
            };
            this.sessionSubject.next(this.currentSession);
            observer.next(res);
          } else {
            this.currentSession = null;
            this.sessionSubject.next(null);
            observer.next(null);
          }
          observer.complete();
        },
        error: (err) => {
          this.currentSession = null;
          this.sessionSubject.next(null);
          observer.error(err);
        }
      });
    });
  }

  /**
   * Gửi heartbeat để giữ session alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
      this.checkInactivity();
    }, this.HEARTBEAT_INTERVAL);
  }

  private sendHeartbeat(): void {
    if (!this.currentSession || !this.currentSession.isActive) return;
    const now = Date.now();
    const tickElapsed = Math.floor((now - this.lastTickTime) / 1000);
    this.lastTickTime = now;
    const inactiveTime = now - this.lastActivityTime;
    if (inactiveTime <= this.INACTIVE_THRESHOLD) {
      this.activeSeconds = Math.min(3600, this.activeSeconds + Math.min(tickElapsed, 60));
    }
    if (this.activeSeconds >= 3600) {
      this.pauseSession();
      return;
    }
    const sessionId = (this.currentSession as any)._id || this.currentSession.id;
    if (sessionId) {
      this.authService.heartbeatSession(String(sessionId)).subscribe({
        error: (err) => console.error('Failed to send heartbeat:', err)
      });
    }
  }

  private flushActiveDelta(): void {
    if (!this.currentSession || !this.currentSession.isActive) return;
    const now = Date.now();
    const tickElapsed = Math.floor((now - this.lastTickTime) / 1000);
    this.lastTickTime = now;
    if (now - this.lastActivityTime <= this.INACTIVE_THRESHOLD) {
      this.activeSeconds = Math.min(3600, this.activeSeconds + Math.max(0, Math.min(tickElapsed, 60)));
    }
  }

  private checkInactivity(): void {
    const inactiveTime = Date.now() - this.lastActivityTime;
    if (inactiveTime > this.INACTIVE_THRESHOLD) {
      this.pauseSession();
    }
  }

  private pauseSession(): void {
    if (this.currentSession && this.currentSession.isActive) {
      this.endSession().subscribe();
    }
  }

  private unloadHandler = (): void => {
    this.flushActiveDelta();
    if (this.currentSession && this.currentSession.isActive) {
      this.endSession().subscribe();
    }
  };

  private bindUnloadListeners(): void {
    if (this.unloadListenersBound || typeof window === 'undefined') return;
    this.unloadListenersBound = true;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeunload', this.unloadHandler);
      document.addEventListener('visibilitychange', this.visibilityHandler);
    });
  }

  private visibilityHandler = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.flushActiveDelta();
      if (this.currentSession && this.currentSession.isActive) {
        this.endSession().subscribe();
      }
    }
  };

  private unbindUnloadListeners(): void {
    if (!this.unloadListenersBound || typeof window === 'undefined') return;
    this.unloadListenersBound = false;
    this.ngZone.runOutsideAngular(() => {
      window.removeEventListener('beforeunload', this.unloadHandler);
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    });
  }

  /**
   * Ghi nhận hoạt động của user
   */
  recordActivity(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * Bind các event listener cho activity tracking
   */
  private bindActivityListeners(): void {
    if (this.activityListenersBound) return;
    
    this.activityListenersBound = true;
    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    this.ngZone.runOutsideAngular(() => {
      events.forEach(event => {
        window.addEventListener(event, this.activityHandler);
      });
    });
  }

  private activityHandler = (): void => {
    this.recordActivity();
  };

  private unbindActivityListeners(): void {
    if (!this.activityListenersBound) return;
    
    this.activityListenersBound = false;
    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    this.ngZone.runOutsideAngular(() => {
      ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
        window.removeEventListener(event, this.activityHandler);
      });
    });
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Cập nhật summary stats
   */
  updateStats(stats: any): void {
    this.statsSubject.next(stats);
  }

  getCurrentSession(): LearningSession | null {
    return this.currentSession;
  }

  isTracking(): boolean {
    return this.currentSession !== null && this.currentSession.isActive;
  }

  /**
   * Auto-tracking dựa trên route
   */
  trackByRoute(url: string): void {
    const skill = this.routeToSkill[url];
    if (skill) {
      this.startTracking(skill);
    } else {
      // Không phải trang học -> kết thúc session
      if (this.currentSession && this.currentSession.isActive) {
        this.endSession().subscribe();
      }
    }
  }

  /**
   * Lấy skill từ URL
   */
  getSkillFromUrl(url: string): string | null {
    // Tìm match chính xác trước
    if (this.routeToSkill[url]) {
      return this.routeToSkill[url];
    }
    
    // Tìm match prefix
    for (const [route, skill] of Object.entries(this.routeToSkill)) {
      if (url.startsWith(route)) {
        return skill;
      }
    }
    
    return null;
  }

  // Lấy stats từ backend
  refreshStats(): void {
    this.authService.getLearningStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.statsSubject.next(res.data);
        }
      },
      error: (err) => console.error('Failed to refresh stats:', err)
    });
  }
}