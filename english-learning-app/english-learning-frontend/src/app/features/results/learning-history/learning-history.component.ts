import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface LearningActivity {
  id: string;
  skill: string;
  skillIcon: string;
  skillColor: string;
  lessonTitle: string;
  durationMinutes: number;
  completedAt: string;
  status: 'completed' | 'in-progress';
}

@Component({
  selector: 'app-learning-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-history.component.html',
  styleUrls: ['./learning-history.component.css']
})
export class LearningHistoryComponent implements OnInit {
  activities: any[] = [];
  filteredActivities: any[] = [];
  loading = false;
  
  searchQuery = '';
  selectedSkill = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  skillFilterOptions = [
    { value: '', label: 'Tất cả kỹ năng' },
    { value: 'vocabulary', label: '📝 Từ vựng' },
    { value: 'grammar', label: '📚 Ngữ pháp' },
    { value: 'listening', label: '🎧 Luyện nghe' },
    { value: 'reading', label: '📖 Luyện đọc' },
    { value: 'speaking', label: '🗣️ Luyện nói' },
    { value: 'writing', label: '✍️ Luyện viết' }
  ];

  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'completed', label: '✅ Hoàn thành' },
    { value: 'in-progress', label: '🔄 Đang học' }
  ];

  totalActivities = 0;
  totalMinutes = 0;
  completedCount = 0;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMockData();
    this.applyFilter();
  }

  ngOnDestroy() {}

  loadMockData() {
    const skills = [
      { skill: 'vocabulary', icon: '📝', color: '#22c55e', label: 'Từ vựng' },
      { skill: 'grammar', icon: '📚', color: '#7c3aed', label: 'Ngữ pháp' },
      { skill: 'listening', icon: '🎧', color: '#3b82f6', label: 'Luyện nghe' },
      { skill: 'reading', icon: '📖', color: '#f59e0b', label: 'Luyện đọc' },
      { skill: 'speaking', icon: '🗣️', color: '#ec4899', label: 'Luyện nói' },
      { skill: 'writing', icon: '✍️', color: '#ec4899', label: 'Luyện viết' }
    ];

    const statuses: ('completed' | 'in-progress')[] = ['completed', 'in-progress'];
    const titles = [
      'Từ vựng chủ đề Du lịch', 'Thì hiện tại đơn', 'Luyện nghe chủ đề Du lịch',
      'Đọc hiểu: Email công việc', 'Luyện phát âm chuẩn', 'Viết email tiếng Anh',
      'Từ vựng IT', 'Câu bị động', 'Nghe hiểu bài báo',
      'Đọc hiểu tin tức', 'Phát âm chuẩn IPA', 'Viết bài luận',
    ];

    this.activities = titles.map((title, idx) => {
      const status = idx % 3 === 0 ? 'completed' : (idx % 3 === 1 ? 'in-progress' : 'completed');
      const skill = ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing'][idx % 6];
      return {
        id: String(idx + 1),
        skill,
        skillIcon: this.getSkillIcon(skill),
        skillColor: this.getSkillColor(skill),
        lessonTitle: title,
        durationMinutes: Math.floor(Math.random() * 30) + 15,
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['completed', 'in-progress'][idx % 2]
      };
    });
    
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.activities];
    
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a => a.lessonTitle.toLowerCase().includes(q));
    }

    if (this.selectedSkill) {
      result = result.filter(a => a.skill === this.selectedSkill);
    }

    if (this.selectedStatus) {
      result = result.filter(a => a.status === this.selectedStatus);
    }

    this.totalActivities = this.activities.length;
    this.totalMinutes = this.activities.reduce((sum, a) => sum + a.durationMinutes, 0);
    this.completedCount = this.activities.filter(a => a.status === 'completed').length;

    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredActivities = result.slice(start, start + this.itemsPerPage);
  }

  onSearch() { this.currentPage = 1; this.applyFilter(); }
  onFilter() { this.currentPage = 1; this.applyFilter(); }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSkillIcon(skill: string): string {
    const icons: Record<string, string> = {
      'vocabulary': '📝', 'grammar': '📚', 'listening': '🎧',
      'reading': '📖', 'speaking': '🗣️', 'writing': '✍️'
    };
    return icons[skill] || '📖';
  }

  getSkillColor(skill: string): string {
    const colors: Record<string, string> = {
      'vocabulary': '#22c55e', 'grammar': '#7c3aed', 'listening': '#3b82f6',
      'reading': '#f59e0b', 'speaking': '#ec4899', 'writing': '#ec4899'
    };
    return colors[skill] || '#7c3aed';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'completed': '✅ Hoàn thành',
      'in-progress': '🔄 Đang học',
      'not-started': '⏳ Chưa bắt đầu'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'completed': 'badge-easy',
      'in-progress': 'badge-medium',
      'not-started': 'badge-basic'
    };
    return map[status] || 'badge-basic';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goBack() {
    window.history.back();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 5);
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}