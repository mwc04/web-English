import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

interface ListenTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  level: string;
  levelClass: string;
  typeName: string;
  typeClass: string;
  difficulty: string;
  diffClass: string;
  episodes: number;
  duration: string;
  questions: number;
}

const TYPE_MAP: Record<string, { label: string; class: string; icon: string }> = {
  conversation: { label: 'Hội thoại', class: 'type-conversation', icon: '🎙️' },
  lecture: { label: 'Bài giảng', class: 'type-lecture', icon: '📖' },
  podcast: { label: 'Podcast', class: 'type-podcast', icon: '🎵' },
  news: { label: 'Tin tức', class: 'type-news', icon: '📰' },
};

const LEVEL_CLASS: Record<string, string> = {
  A1: 'level-A1', A2: 'level-A2', B1: 'level-B1', B2: 'level-B2', C1: 'level-C1',
};

const DIFF_MAP: Record<string, { label: string; class: string }> = {
  A1: { label: 'Dễ', class: 'diff-easy' },
  A2: { label: 'Dễ', class: 'diff-easy' },
  B1: { label: 'Trung bình', class: 'diff-medium' },
  B2: { label: 'Khó', class: 'diff-hard' },
  C1: { label: 'Khó', class: 'diff-hard' },
};

@Component({
  selector: 'app-listening',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listening.component.html',
  styleUrls: ['./listening.component.css']
})
export class ListeningComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedType = '';
  selectedLevel = '';
  currentPage = 1;
  itemsPerPage = 9;

  allTopics: ListenTopic[] = [];
  filteredTopics: ListenTopic[] = [];
  pages: number[] = [];
  totalPages = 1;
  loading = false;

  constructor(private router: Router, private learningTracker: LearningTrackerService) {}

  ngOnInit() {
    this.fetchListening();
    this.learningTracker.startTracking('listening');
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }

  async fetchListening() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/listening');
      const json = await res.json();
      const items: any[] = json.data || [];

      this.allTopics = items.map((item: any, idx: number) => {
        const type = TYPE_MAP[item.type] || TYPE_MAP['conversation'];
        const levelClass = LEVEL_CLASS[item.level] || 'level-A1';
        const diff = DIFF_MAP[item.level] || DIFF_MAP['A1'];
        const qs = Array.isArray(item.questions_json) ? item.questions_json.length : 0;
        return {
          id: item._id || String(idx),
          title: item.title,
          subtitle: item.subtitle || '',
          icon: type.icon,
          level: item.level || 'A1',
          levelClass,
          typeName: type.label,
          typeClass: type.class,
          difficulty: diff.label,
          diffClass: diff.class,
          episodes: 1,
          duration: item.duration ? `${item.duration} phút` : '30 phút',
          questions: qs,
        };
      });

      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  onSearch() { this.currentPage = 1; this.applyFilter(); }
  onFilter() { this.currentPage = 1; this.applyFilter(); }

  applyFilter() {
    let result = [...this.allTopics];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
      );
    }

    if (this.selectedType) {
      const typeMap: Record<string, string> = {
        conversation: 'Hội thoại', lecture: 'Bài giảng',
        podcast: 'Podcast', news: 'Tin tức'
      };
      result = result.filter(t => t.typeName === typeMap[this.selectedType]);
    }

    if (this.selectedLevel) {
      result = result.filter(t => t.level === this.selectedLevel);
    }

    this.totalPages = Math.max(1, Math.ceil(result.length / this.itemsPerPage));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredTopics = result.slice(start, start + this.itemsPerPage);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToLesson(id: string) { this.router.navigate(['/listening', id]); }
  navigate(path: string) { this.router.navigate([path]); }
}
