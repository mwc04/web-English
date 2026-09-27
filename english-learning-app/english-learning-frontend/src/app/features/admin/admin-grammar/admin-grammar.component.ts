import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const CATEGORIES = [
  { value: 'tenses', label: '🕐 Thì (Tenses)' },
  { value: 'parts-of-speech', label: '📝 Từ loại' },
  { value: 'sentence-structure', label: '🏗️ Cấu trúc câu' },
  { value: 'conditionals', label: '🔀 Câu điều kiện' },
  { value: 'passive-voice', label: '🔄 Câu bị động' },
  { value: 'reported-speech', label: '💬 Câu tường thuật' },
  { value: 'modal-verbs', label: '⚡ Động từ khuyết thiếu' },
  { value: 'prepositions', label: '📍 Giới từ' },
  { value: 'conjunctions', label: '🔗 Liên từ' },
  { value: 'articles', label: '📌 Mạo từ' },
];

const LEVELS = [
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
];

const DIFFS = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

@Component({
  selector: 'app-admin-grammar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-grammar.component.html',
  styleUrls: ['./admin-grammar.component.css']
})
export class AdminGrammarComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  filteredItems: any[] = [];
  showModal = false;
  editItem: any = null;
  showContent = false;

  formData: any = {
    rule_name: '',
    explanation: '',
    example: '',
    category: 'tenses',
    level: 'beginner',
    difficulty: 'easy',
    structure: '',
    usageText: '',
    defText: '',
    examplesText: '',
    rulesText: '',
    errorsText: '',
  };

  levels = LEVELS;
  diffs = DIFFS;
  categories = CATEGORIES;
  loading = false;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/grammar');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    const cat = this.searchQuery.startsWith('cat:') ? this.searchQuery.slice(4) : '';
    this.filteredItems = this.items.filter((i: any) =>
      cat ? i.category === cat : (!q || i.rule_name?.toLowerCase().includes(q) || i.explanation?.toLowerCase().includes(q))
    );
  }

  openAdd() {
    this.editItem = null;
    this.showContent = false;
    this.formData = { rule_name: '', explanation: '', example: '', category: 'tenses', level: 'beginner', difficulty: 'easy', structure: '', usageText: '', defText: '', examplesText: '', rulesText: '', errorsText: '' };
    this.showModal = true;
    this.initEditors();
  }

  openEdit(item: any) {
    this.editItem = item;
    this.showContent = false;

    const content = item.content || {};
    const sections = content.sections || [];
    const defSec = sections.find((s: any) => s.type === 'definition');
    const exSec = sections.find((s: any) => s.type === 'examples');
    const rulesSec = sections.find((s: any) => s.type === 'rules');
    const errSec = sections.find((s: any) => s.type === 'errors');

    this.formData = {
      rule_name: item.rule_name,
      explanation: item.explanation,
      example: item.example || '',
      category: item.category || 'tenses',
      level: item.level || 'beginner',
      difficulty: item.difficulty || 'easy',
      structure: item.structure || '',
      usageText: (item.usage || []).join('\n'),
      defText: defSec?.text || '',
      examplesText: (exSec?.items || []).map((i: any) => i.text).join('\n'),
      rulesText: (rulesSec?.items || []).map((i: any) => i.text).join('\n'),
      errorsText: (errSec?.items || []).map((i: any) => i.text).join('\n'),
    };
    this.showModal = true;
    this.initEditors();
  }

  async save() {
    this.loading = true;
    const body: any = {
      rule_name: this.formData.rule_name,
      explanation: this.formData.explanation,
      example: this.formData.example,
      category: this.formData.category,
      level: this.formData.level,
      difficulty: this.formData.difficulty,
    };

    if (this.formData.structure) body.structure = this.formData.structure;

    const usageLines = this.formData.usageText.split('\n').filter((l: string) => l.trim());
    if (usageLines.length) body.usage = usageLines;

    const sections: any[] = [];

    if (this.formData.defText) {
      sections.push({ type: 'definition', title: 'Định nghĩa', icon: '📘', subtitle: 'Khái niệm cơ bản', label: 'Định nghĩa', text: this.formData.defText });
    }

    const exLines = this.formData.examplesText.split('\n').filter((l: string) => l.trim());
    if (exLines.length) {
      sections.push({ type: 'examples', title: 'Ví dụ trong câu', items: exLines.map((t: string) => ({ text: t, correct: true })) });
    }

    const ruleLines = this.formData.rulesText.split('\n').filter((l: string) => l.trim());
    if (ruleLines.length) {
      sections.push({ type: 'rules', title: 'Quy tắc quan trọng', items: ruleLines.map((t: string, i: number) => ({ num: i + 1, text: t })) });
    }

    const errLines = this.formData.errorsText.split('\n').filter((l: string) => l.trim());
    if (errLines.length) {
      sections.push({ type: 'errors', title: 'Lỗi thường gặp', items: errLines.map((t: string) => ({ text: t })) });
    }

    if (sections.length) body.content = { sections };

    try {
      if (this.editItem) {
        await fetch(`http://localhost:5000/api/grammar/${this.editItem._id}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(body)
        });
      } else {
        await fetch('http://localhost:5000/api/grammar', {
          method: 'POST', headers: this.headers, body: JSON.stringify(body)
        });
      }
      this.showModal = false;
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }

  levelLabel(level: string): string {
    const m: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
    return m[level] || level;
  }

  catLabel(cat: string): string {
    const m: Record<string, string> = { tenses: 'Thì', 'parts-of-speech': 'Từ loại', 'sentence-structure': 'Cấu trúc câu', conditionals: 'Câu điều kiện', 'passive-voice': 'Câu bị động', 'reported-speech': 'Câu tường thuật', 'modal-verbs': 'Động từ K.thiếu', prepositions: 'Giới từ', conjunctions: 'Liên từ', articles: 'Mạo từ' };
    return m[cat] || cat;
  }

  diffLabel(diff: string): string {
    const m: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
    return m[diff] || diff;
  }

  execCmd(cmd: string) {
    document.execCommand(cmd);
  }

  onContent(event: Event) {
    const el = event.target as HTMLElement;
    const field = el.getAttribute('data-field') || '';
    this.formData[field] = el.innerHTML;
  }

  private initEditors() {
    requestAnimationFrame(() => {
      document.querySelectorAll('.editor-content').forEach(el => {
        const field = el.getAttribute('data-field');
        if (field) el.innerHTML = this.formData[field] || '';
      });
    });
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa ngữ pháp này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/grammar/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }
}
