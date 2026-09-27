import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';

interface Lesson {
  id: string;
  title: string;
  description: string;
  skill: string;         // label tiếng Việt, VD: "Từ vựng"
  skillKey: string;      // key tiếng Anh, VD: "vocabulary" (dùng để route)
  icon: string;
  level: string;
  levelClass: string;
  borderColor: string;
  lessons: number;
  minutes: number;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
}

interface SkillBreakdown {
  name: string;
  icon: string;
  bgColor: string;
  gradient: string;
  completed: number;
  total: number;
  percent: number;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface ActivityChartData {
  label: string;
  minutes: number;
  percent: number;
  isToday: boolean;
  isFuture: boolean;
}

interface SummaryStat {
  icon: string;
  label: string;
  value: string;
  bg: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // ===== User =====
  user: User | null = null;

  // ===== Search & Filter =====
  searchQuery = '';
  filterTabs = ['Tất cả', 'Từ vựng', 'Ngữ pháp', 'Luyện nghe', 'Luyện đọc', 'Luyện nói', 'Luyện viết'];
  activeTab = 'Tất cả';
  selectedSkill = '';        // label tiếng Việt
  selectedStatus = '';

  // ===== Progress =====
  completedTopics = 0;
  totalTopics = 0;
  progressPercent = 0;
  streakDays = 0;
  recentActivityMinutes = 0;
  todayMinutes = 0;
  weeklyTotalMinutes = 0;
  avgDailyMinutes = 0;

  // ===== Chart =====
  activityChartData: ActivityChartData[] = [];
  yAxisTicks: number[] = [0, 15, 30, 45, 60];
  hoveredDay = -1;
  summaryStats: SummaryStat[] = [];

  // ===== Pagination =====
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  loading = false;

  // ===== Data =====
  allLessons: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  skillsBreakdown: SkillBreakdown[] = [];
  achievements: Achievement[] = [];

  // ===== Constants =====
  private readonly SKILL_META: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
    vocabulary: { label: 'Từ vựng',   icon: '📝', color: '#22c55e', gradient: 'linear-gradient(90deg, #22c55e, #4ade80)' },
    grammar:    { label: 'Ngữ pháp',  icon: '📚', color: '#7c3aed', gradient: 'linear-gradient(90deg, #7c3aed, #a855f7)' },
    listening:  { label: 'Luyện nghe', icon: '🎧', color: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
    reading:    { label: 'Luyện đọc',  icon: '📖', color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
    speaking:   { label: 'Luyện nói',  icon: '🗣️', color: '#ec4899', gradient: 'linear-gradient(90deg, #ec4899, #f472b6)' },
    writing:    { label: 'Luyện viết', icon: '✍️', color: '#06b6d4', gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)' },
  };

  private readonly LEVEL_META: Record<string, { label: string; class: string }> = {
    beginner:     { label: 'Cơ bản',    class: 'badge-basic' },
    intermediate: { label: 'Trung bình', class: 'badge-medium' },
    advanced:     { label: 'Nâng cao',   class: 'badge-advanced' },
  };

  private readonly SKILL_LABEL_TO_KEY: Record<string, string> = {
    'Từ vựng': 'vocabulary',
    'Ngữ pháp': 'grammar',
    'Luyện nghe': 'listening',
    'Luyện đọc': 'reading',
    'Luyện nói': 'speaking',
    'Luyện viết': 'writing',
  };

  private readonly SKILL_KEY_TO_ROUTE: Record<string, string> = {
    vocabulary: '/vocabulary',
    grammar:    '/grammar',
    listening:  '/listening',
    reading:    '/reading',
    speaking:   '/speaking',
    writing:    '/writing',
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.resetToEmptyState();
    this.loadUserProfile();
    this.loadLearningData();
  }

  // ============================================================
  // LOAD USER PROFILE
  // ============================================================
  async loadUserProfile() {
    try {
      const res = await this.authService.getMe().toPromise();
      if (res?.success && res.data) {
        this.user = res.data;
        this.streakDays = res.data.streakDays || 0;
        this.updateSummaryStats();
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }
  }

  // ============================================================
  // LOAD LEARNING DATA
  // ============================================================
  async loadLearningData() {
    this.loading = true;
    try {
      const res = await this.authService.getLearningStats().toPromise();
      if (res?.success && res.data) {
        const data = res.data;

        this.completedTopics       = data.completedLessons ?? 0;
        this.totalTopics           = data.totalLessons ?? 0;
        this.progressPercent       = this.totalTopics > 0
          ? Math.round((this.completedTopics / this.totalTopics) * 100)
          : 0;
        this.streakDays            = data.streakDays ?? this.streakDays ?? 0;
        this.todayMinutes          = data.todayMinutes ?? 0;
        this.weeklyTotalMinutes    = data.weeklyMinutes ?? 0;
        this.avgDailyMinutes       = data.avgDailyMinutes ?? 0;
        this.recentActivityMinutes = this.todayMinutes;

        // Skills breakdown từ API (chỉ gán nếu API trả về)
        if (Array.isArray(data.skillStats) && data.skillStats.length > 0) {
          this.skillsBreakdown = data.skillStats.map((s: any) => {
            const key = s.key || s.skill || 'vocabulary';
            const meta = this.SKILL_META[key] ?? this.SKILL_META['vocabulary'];
            return {
              name: s.name || meta.label,
              icon: meta.icon,
              bgColor: meta.color + '20',
              gradient: meta.gradient,
              completed: s.completed ?? 0,
              total: s.total ?? 0,
              percent: s.percent ?? (s.total ? Math.round((s.completed / s.total) * 100) : 0),
            };
          });
        }

        // Achievements từ API (đã tính thật từ DB)
        if (Array.isArray(data.achievements) && data.achievements.length > 0) {
          this.achievements = data.achievements;
        }

        // Activity chart từ API (chỉ gán nếu API có data thực sự có thời gian học)
        if (Array.isArray(data.activityChartData) && data.activityChartData.length > 0 &&
            data.activityChartData.some((d: any) => d.minutes > 0)) {
          this.activityChartData = data.activityChartData;
        } else {
          this.activityChartData = [];
        }

        this.updateSummaryStats();
      }
      // Nếu API không có data → giữ empty state
    } catch (e) {
      console.error('Failed to load learning stats', e);
      // Giữ empty state, không dùng mock data
    }

    // Load lessons (song song hoặc sau cùng)
    await this.loadLessons();
    this.loading = false;
  }

  // ============================================================
  // LOAD LESSONS
  // ============================================================
  async loadLessons() {
    try {
      const res = await this.authService.getLearningSessions(1, 20).toPromise();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        this.allLessons = res.data.map((item: any, idx: number) => {
          const skillKey = item.skill || 'vocabulary';
          const skillMeta = this.SKILL_META[skillKey] ?? this.SKILL_META['vocabulary'];
          const levelMeta = this.LEVEL_META[item.level] ?? this.LEVEL_META['beginner'];
          const status: Lesson['status'] = item.status || 'not-started';

          return {
            id: String(item._id ?? idx),
            title: item.title || item.lessonTitle || 'Bài học',
            description: item.description || 'Mô tả bài học',
            skill: skillMeta.label,
            skillKey,
            icon: skillMeta.icon,
            level: levelMeta.label,
            levelClass: levelMeta.class,
            borderColor: skillMeta.color,
            lessons: item.lessons ?? 1,
            minutes: item.minutes ?? 30,
            status,
            progress: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0,
          };
        });
      } else {
        // User chưa học gì — để trống, template hiện empty-state
        this.allLessons = [];
      }
    } catch (e) {
      console.error('Failed to load learning sessions', e);
      this.allLessons = [];
    }

    // Chỉ tính progress nếu API không cung cấp
    if (this.totalTopics === 0) this.calculateProgress();
    this.applyFilter();
  }

  // ============================================================
  // SKILL / LEVEL META HELPERS
  // ============================================================
  getSkillIcon(skill: string): string {
    const key = this.SKILL_LABEL_TO_KEY[skill] || skill;
    return this.SKILL_META[key]?.icon ?? '📝';
  }

  getSkillColor(skill: string): string {
    const key = this.SKILL_LABEL_TO_KEY[skill] || skill;
    return this.SKILL_META[key]?.color ?? '#7c3aed';
  }

  getSkillGradient(skill: string): string {
    const key = this.SKILL_LABEL_TO_KEY[skill] || skill;
    return this.SKILL_META[key]?.gradient ?? 'linear-gradient(90deg, #7c3aed, #a855f7)';
  }

  levelClass(level: string): string {
    const found = Object.values(this.LEVEL_META).find(l => l.label === level);
    return found?.class ?? 'badge-basic';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'completed': 'badge-easy',
      'in-progress': 'badge-medium',
      'not-started': 'badge-basic',
    };
    return map[status] ?? 'badge-basic';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'completed': '✅ Hoàn thành',
      'in-progress': '🔄 Đang học',
      'not-started': '⏳ Chưa bắt đầu',
    };
    return map[status] ?? status;
  }

  // ============================================================
  // MOCK LESSONS (cho user mới)
  // ============================================================
  private getMockLessons(): Lesson[] {
    const skillKeys = ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing'];
    const levelKeys = ['beginner', 'intermediate', 'advanced'];
    const titles = [
      'Từ vựng chủ đề Du lịch', 'Thì hiện tại đơn', 'Luyện nghe chủ đề Du lịch',
      'Đọc hiểu: Email công việc', 'Luyện phát âm chuẩn', 'Viết email tiếng Anh',
      'Từ vựng IT', 'Câu bị động', 'Nghe hiểu bài báo',
      'Đọc hiểu tin tức', 'Phát âm chuẩn IPA', 'Viết bài luận',
    ];

    return titles.map((title, idx) => {
      const skillKey = skillKeys[idx % skillKeys.length];
      const levelKey = levelKeys[idx % levelKeys.length];
      const skillMeta = this.SKILL_META[skillKey];
      const levelMeta = this.LEVEL_META[levelKey];

      return {
        id: String(idx + 1),
        title,
        description: `Mô tả chi tiết cho ${title}`,
        skill: skillMeta.label,
        skillKey,
        icon: skillMeta.icon,
        level: levelMeta.label,
        levelClass: levelMeta.class,
        borderColor: skillMeta.color,
        lessons: (idx % 3) + 1,
        minutes: 15 + (idx % 30),
        status: 'not-started' as const,
        progress: 0,
      };
    });
  }

  // ============================================================
  // CALCULATE PROGRESS (fallback khi API không có data)
  // ============================================================
  calculateProgress() {
    this.totalTopics = this.allLessons.length;
    this.completedTopics = this.allLessons.filter(l => l.status === 'completed').length;
    this.progressPercent = this.totalTopics > 0
      ? Math.round((this.completedTopics / this.totalTopics) * 100)
      : 0;

    // Skills breakdown nếu API chưa cung cấp
    if (this.skillsBreakdown.length === 0) {
      this.skillsBreakdown = Object.keys(this.SKILL_META).map(key => {
        const meta = this.SKILL_META[key];
        const skillLessons = this.allLessons.filter(l => l.skillKey === key);
        const total = skillLessons.length;
        const completed = skillLessons.filter(l => l.status === 'completed').length;
        return {
          name: meta.label,
          icon: meta.icon,
          bgColor: meta.color + '20',
          gradient: meta.gradient,
          completed,
          total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });
    }

    // Achievements (chỉ build 1 lần)
    if (this.achievements.length === 0) {
      this.achievements = this.buildAchievements();
    }
  }

  private buildAchievements(): Achievement[] {
    return [
      { title: 'Người mới bắt đầu', description: 'Hoàn thành 5 bài học đầu tiên', icon: '🌱', bgColor: '#22c55e20', unlocked: this.completedTopics >= 5, progress: Math.min(this.completedTopics, 5), target: 5 },
      { title: 'Người chăm chỉ',    description: 'Học liên tục 7 ngày',          icon: '🔥', bgColor: '#f59e0b20', unlocked: this.streakDays >= 7,     progress: Math.min(this.streakDays, 7),     target: 7 },
      { title: 'Bậc thầy từ vựng',  description: 'Học 100 phút từ vựng',           icon: '📝', bgColor: '#22c55e20', unlocked: false, progress: 0, target: 100 },
      { title: 'Ngữ pháp master',   description: 'Hoàn thành 20 phiên ngữ pháp',  icon: '📚', bgColor: '#7c3aed20', unlocked: false, progress: 0, target: 20 },
      { title: 'Thần thánh nghe',   description: 'Luyện nghe 10 giờ',             icon: '🎧', bgColor: '#3b82f620', unlocked: false, progress: 0, target: 10 },
      { title: 'Thần tốc đọc',      description: 'Hoàn thành 50 phiên đọc',       icon: '📖', bgColor: '#f59e0b20', unlocked: false, progress: 0, target: 50 },
    ];
  }

  // ============================================================
  // SUMMARY STATS
  // ============================================================
  private updateSummaryStats() {
    this.summaryStats = [
      { icon: '📅', label: 'Hôm nay',        value: String(this.todayMinutes),       bg: 'linear-gradient(135deg, #ede9fe 0%, #7c3aed 100%)' },
      { icon: '📅', label: 'Tuần này',       value: String(this.weeklyTotalMinutes), bg: 'linear-gradient(135deg, #fff7e6 0%, #f59e0b 100%)' },
      { icon: '🔥', label: 'Ngày liên tiếp', value: String(this.streakDays),         bg: 'linear-gradient(135deg, #ecfdf3 0%, #22c55e 100%)' },
    ];
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================
  resetToEmptyState() {
    this.completedTopics = 0;
    this.totalTopics = 0;
    this.progressPercent = 0;
    this.streakDays = 0;
    this.todayMinutes = 0;
    this.weeklyTotalMinutes = 0;
    this.avgDailyMinutes = 0;
    this.recentActivityMinutes = 0;
    this.skillsBreakdown = [];
    this.activityChartData = [];
    this.updateSummaryStats();
  }

  // ============================================================
  // FILTER & PAGINATION
  // ============================================================
  onSearch() { this.currentPage = 1; this.applyFilter(); }

  setTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.selectedSkill = tab === 'Tất cả' ? '' : tab;
    this.applyFilter();
  }

  onFilter() { this.currentPage = 1; this.applyFilter(); }

  applyFilter() {
    let result = [...this.allLessons];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }

    if (this.selectedSkill) {
      result = result.filter(l => l.skill === this.selectedSkill);
    }

    if (this.selectedStatus) {
      result = result.filter(l => l.status === this.selectedStatus);
    }

    this.totalPages = Math.max(1, Math.ceil(result.length / this.itemsPerPage));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredLessons = result.slice(start, start + this.itemsPerPage);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  trackById(_: number, lesson: Lesson) {
    return lesson.id;
  }

  goToLesson(id: string) {
    const lesson = this.allLessons.find(l => l.id === id);
    if (!lesson) return;

    const route = this.SKILL_KEY_TO_ROUTE[lesson.skillKey] || '/home';
    this.router.navigate([route, id]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}