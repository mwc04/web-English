import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'tenses': { label: 'Thì (Tenses)', icon: '🕐' },
  'parts-of-speech': { label: 'Từ loại', icon: '📝' },
  'sentence-structure': { label: 'Cấu trúc câu', icon: '🏗️' },
  'conditionals': { label: 'Câu điều kiện', icon: '🔀' },
  'passive-voice': { label: 'Câu bị động', icon: '🔄' },
  'reported-speech': { label: 'Câu tường thuật', icon: '💬' },
  'modal-verbs': { label: 'Động từ khuyết thiếu', icon: '⚡' },
  'prepositions': { label: 'Giới từ', icon: '📍' },
  'conjunctions': { label: 'Liên từ', icon: '🔗' },
  'articles': { label: 'Mạo từ', icon: '📌' },
};

@Component({
  selector: 'app-grammar-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grammar-detail.component.html',
  styleUrls: ['./grammar-detail.component.css']
})
export class GrammarDetailComponent implements OnInit {
  rule: any = null;
  sections: any[] = [];
  loading = false;
  error = '';
  activeTab = 'ly-thuyet';
  catMeta = CATEGORY_META;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.fetchGrammar(id);
    });
  }

  async fetchGrammar(id: string) {
    this.loading = true;
    this.error = '';
    try {
      const res = await fetch(`http://localhost:5000/api/grammar/${id}`);
      const json = await res.json();
      if (json.success) {
        this.rule = json.data;
        this.sections = json.data.content?.sections || [];
      } else {
        this.error = 'Không tìm thấy bài học';
      }
    } catch {
      this.error = 'Lỗi kết nối máy chủ';
    }
    this.loading = false;
  }

  get defSection(): any {
    return this.sections.find((s: any) => s.type === 'definition');
  }

  get exampleItems(): any[] {
    const ex = this.sections.find((s: any) => s.type === 'examples');
    return ex?.items || [];
  }

  get structSection(): any {
    return this.sections.find((s: any) => s.type === 'structure');
  }

  get classifySection(): any {
    return this.sections.find((s: any) => s.type === 'classification');
  }

  get rulesSection(): any {
    return this.sections.find((s: any) => s.type === 'rules');
  }

  get errorsSection(): any {
    return this.sections.find((s: any) => s.type === 'errors');
  }

  get otherSections(): any[] {
    const known = ['definition', 'examples', 'structure', 'classification', 'rules', 'errors'];
    return this.sections.filter((s: any) => !known.includes(s.type));
  }

  get levelLabel(): string {
    const map: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
    return map[this.rule?.level] || 'Cơ bản';
  }

  get levelClass(): string {
    const map: Record<string, string> = { beginner: 'level-beginner', intermediate: 'level-intermediate', advanced: 'level-advanced' };
    return map[this.rule?.level] || 'level-beginner';
  }

  get diffLabel(): string {
    const map: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
    return map[this.rule?.difficulty] || 'Dễ';
  }

  get diffClass(): string {
    const map: Record<string, string> = { easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard' };
    return map[this.rule?.difficulty] || 'diff-easy';
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/grammar']);
  }
}
