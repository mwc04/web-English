import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

interface VocabTopic {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  colorClass: string;
  icon: string;
  wordCount: number;
  learned: number;
  progress: number;
}

const CATEGORY_META: Record<string, { icon: string; colorClass: string; subtitle: string }> = {
  'Du lịch': { icon: '✈️', colorClass: 'color-travel', subtitle: 'Từ vựng chủ đề du lịch' },
  'Công nghệ': { icon: '💻', colorClass: 'color-tech', subtitle: 'Từ vựng về công nghệ thông tin' },
  'Sức khỏe': { icon: '🏥', colorClass: 'color-health', subtitle: 'Từ vựng y tế và sức khỏe' },
  'Ẩm thực': { icon: '🍜', colorClass: 'color-food', subtitle: 'Từ vựng ẩm thực và đồ uống' },
  'Thiên nhiên': { icon: '🌿', colorClass: 'color-nature', subtitle: 'Từ vựng về thiên nhiên và môi trường' },
  'Kinh doanh': { icon: '💼', colorClass: 'color-business', subtitle: 'Từ vựng thương mại và kinh doanh' },
  'Giáo dục': { icon: '📚', colorClass: 'color-education', subtitle: 'Từ vựng giáo dục và học thuật' },
  'Thể thao': { icon: '⚽', colorClass: 'color-sport', subtitle: 'Từ vựng thể thao và vận động' },
  'Nghệ thuật': { icon: '🎨', colorClass: 'color-art', subtitle: 'Từ vựng nghệ thuật và văn hóa' },
  'General': { icon: '📖', colorClass: 'color-general', subtitle: 'Từ vựng tổng hợp' },
};

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.css']
})
export class VocabularyComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedTab = 'all';
  selectedSort = 'default';
  currentPage = 1;
  itemsPerPage = 9;

  tabs = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Du lịch', value: 'travel' },
    { label: 'Công nghệ', value: 'tech' },
    { label: 'Sức khỏe', value: 'health' },
    { label: 'Ẩm thực', value: 'food' },
    { label: 'Thiên nhiên', value: 'nature' },
    { label: 'Kinh doanh', value: 'business' },
  ];

  allTopics: VocabTopic[] = [];
  filteredTopics: VocabTopic[] = [];
  pages: number[] = [];
  totalPages = 1;
  loading = false;

  private tabMap: Record<string, string> = {
    travel: 'Du lịch', tech: 'Công nghệ', health: 'Sức khỏe',
    food: 'Ẩm thực', nature: 'Thiên nhiên', business: 'Kinh doanh'
  };

  constructor(private router: Router, private learningTracker: LearningTrackerService) {}

  ngOnInit() {
    this.fetchVocabularies();
    this.learningTracker.startTracking('vocabulary');
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }

  async fetchVocabularies() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/vocabularies');
      const json = await res.json();
      const items: any[] = json.data || [];

      const grouped: Record<string, any[]> = {};
      for (const item of items) {
        const cat = item.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      }

      this.allTopics = Object.entries(grouped).map(([category, words], idx) => {
        const meta = CATEGORY_META[category] || { icon: '📖', colorClass: 'color-general', subtitle: '' };
        return {
          id: category,
          title: `Topic: ${category}`,
          subtitle: meta.subtitle,
          category,
          colorClass: meta.colorClass,
          icon: meta.icon,
          wordCount: words.length,
          learned: 0,
          progress: 0,
        };
      });

      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  onSearch() { this.currentPage = 1; this.applyFilter(); }
  onFilter() { this.currentPage = 1; this.applyFilter(); }

  selectTab(val: string) {
    this.selectedTab = val;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.allTopics];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q));
    }

    if (this.selectedTab !== 'all') {
      const cat = this.tabMap[this.selectedTab];
      result = result.filter(t => t.category === cat);
    }

    if (this.selectedSort === 'progress') result.sort((a, b) => b.progress - a.progress);
    else if (this.selectedSort === 'words') result.sort((a, b) => b.wordCount - a.wordCount);
    else if (this.selectedSort === 'name') result.sort((a, b) => a.title.localeCompare(b.title));

    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredTopics = result.slice(start, start + this.itemsPerPage);
  }

  getStatusClass(progress: number): string {
    if (progress === 0) return 'status-new';
    if (progress === 100) return 'status-done';
    return 'status-learning';
  }

  getStatusText(progress: number): string {
    if (progress === 0) return 'Chưa học';
    if (progress === 100) return '✓ Hoàn thành';
    return 'Đang học';
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToTopic(id: string) {
    this.router.navigate(['/vocabulary', encodeURIComponent(id)]);
  }
}
