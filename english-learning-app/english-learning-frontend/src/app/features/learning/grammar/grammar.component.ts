import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  'tenses': { label: 'Thì', icon: '🕐', color: '#7c3aed' },
  'parts-of-speech': { label: 'Từ loại', icon: '📝', color: '#f59e0b' },
  'sentence-structure': { label: 'Cấu trúc câu', icon: '🏗️', color: '#22c55e' },
  'conditionals': { label: 'Câu điều kiện', icon: '🔀', color: '#3b82f6' },
  'passive-voice': { label: 'Câu bị động', icon: '🔄', color: '#ec4899' },
  'reported-speech': { label: 'Câu tường thuật', icon: '💬', color: '#06b6d4' },
  'modal-verbs': { label: 'Động từ khuyết thiếu', icon: '⚡', color: '#f97316' },
  'prepositions': { label: 'Giới từ', icon: '📍', color: '#84cc16' },
  'conjunctions': { label: 'Liên từ', icon: '🔗', color: '#a855f7' },
  'articles': { label: 'Mạo từ', icon: '📌', color: '#eab308' },
};

interface RawGrammarTopic {
  _id?: string;
  rule_name: string;
  explanation: string;
  category: string;
  level: string;
  difficulty: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;      // display label: "Thì", "Từ loại"...
  level: string;         // "Cơ bản" | "Trung cấp" | "Nâng cao"
  borderColor: string;   // hex color
  minutes: number;
}

const LEVEL_MAP: Record<string, { label: string; class: string }> = {
  beginner: { label: 'Cơ bản', class: 'level-beginner' },
  intermediate: { label: 'Trung cấp', class: 'level-intermediate' },
  advanced: { label: 'Nâng cao', class: 'level-advanced' },
};

const DIFF_MAP: Record<string, { label: string; class: string }> = {
  easy: { label: 'Dễ', class: 'diff-easy' },
  medium: { label: 'Trung bình', class: 'diff-medium' },
  hard: { label: 'Khó', class: 'diff-hard' },
};

@Component({
  selector: 'app-grammar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.css']
})
export class GrammarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedLevel = '';
  selectedCategory = '';
  currentPage = 1;
  itemsPerPage = 6; // match design: 6 items per page (3 cols x 2 rows)

  // UI state matching the design
  filterTabs = ['Tất cả', 'Thì', 'Từ loại', 'Cấu trúc câu', 'Câu điều kiện', 'Câu bị động', 'Câu tường thuật'];
  activeTab = 'Tất cả';

  allTopics: Topic[] = [];      // full mapped list
  topics: Topic[] = [];         // displayed (filtered + paginated)
  totalPages = 1;
  loading = false;

  // Progress card (demo)
  completedTopics = 0;
  totalTopics = 0;
  progressPercent = 0;

  categories = CATEGORY_META;

  constructor(private router: Router, private learningTracker: LearningTrackerService) {}

  ngOnInit() {
    this.fetchGrammar();
    this.learningTracker.startTracking('grammar');
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }

  async fetchGrammar() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/grammar');
      const json = await res.json();
      const items: RawGrammarTopic[] = json.data || [];

      this.allTopics = items.map((item, idx) => {
        const level = LEVEL_MAP[item.level] || LEVEL_MAP['beginner'];
        const meta = CATEGORY_META[item.category] || CATEGORY_META['tenses'];
        return {
          id: item._id || String(idx),
          title: item.rule_name,
          description: item.explanation,
          category: meta.label,
          level: level.label,
          borderColor: meta.color,
          minutes: 30,
        };
      });

      this.totalTopics = this.allTopics.length;
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  onSearch() { this.currentPage = 1; this.applyFilter(); }

  setTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
    if (tab === 'Tất cả') {
      this.selectedCategory = '';
    } else {
      const tabToCategory: Record<string, string> = {
        'Thì': 'tenses',
        'Từ loại': 'parts-of-speech',
        'Cấu trúc câu': 'sentence-structure',
        'Câu điều kiện': 'conditionals',
        'Câu bị động': 'passive-voice',
        'Câu tường thuật': 'reported-speech',
      };
      this.selectedCategory = tabToCategory[tab] || '';
    }
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.allTopics];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (this.selectedCategory) {
      const meta = CATEGORY_META[this.selectedCategory];
      if (meta) result = result.filter(t => t.category === meta.label);
    }
    // Note: level filter via dropdowns in topics-header is NOT wired (static in design)

    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.topics = result.slice(start, start + this.itemsPerPage);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  levelClass(level: string): string {
    const map: Record<string, string> = {
      'Cơ bản': 'badge-basic',
      'Trung cấp': 'badge-medium',
      'Nâng cao': 'badge-easy',
    };
    return map[level] || 'badge-basic';
  }

  trackById(_: number, topic: Topic) {
    return topic.id;
  }

  goToLesson(id: string) {
    this.router.navigate(['/grammar', id]);
  }
}