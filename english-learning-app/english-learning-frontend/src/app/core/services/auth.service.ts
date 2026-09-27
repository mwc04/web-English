import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    level: string;
    token: string;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  full_name: string;
  level: string;
  placementTaken?: boolean;
  placementScore?: number;
  placementDate?: string;
  created_at: string;
  // Learning tracking fields
  lastActiveAt?: string;
  totalLearningMinutes?: number;
  streakDays?: number;
  lastLearningDate?: string;
  learningStats?: {
    vocabulary: { minutes: number; sessions: number };
    grammar: { minutes: number; sessions: number };
    listening: { minutes: number; sessions: number };
    reading: { minutes: number; sessions: number };
    speaking: { minutes: number; sessions: number };
    writing: { minutes: number; sessions: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(data: { username: string; email: string; password: string; full_name: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => localStorage.setItem('token', res.data.token))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => localStorage.setItem('token', res.data.token))
    );
  }

  getMe(): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/me`);
  }

  savePlacementResult(level: string, score: number): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(
      `${environment.apiUrl}/users/me/placement`,
      { level, score }
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Learning Session Tracking Methods
  startLearningSession(skill: string, lessonId?: string, lessonTitle?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/learning-sessions/start`, { skill, lessonId, lessonTitle });
  }

  endLearningSession(skill?: string, activeSeconds?: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/learning-sessions/end`, { skill, activeSeconds });
  }

  heartbeatSession(sessionId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/learning-sessions/heartbeat`, { sessionId });
  }

  getLearningStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/user/learning-stats`);
  }

  getLearningSessions(page = 1, limit = 20, skill?: string): Observable<any> {
    let params = `page=${page}&limit=${limit}`;
    if (skill) params += `&skill=${skill}`;
    return this.http.get(`${environment.apiUrl}/user/learning-sessions?${params}`);
  }
}
