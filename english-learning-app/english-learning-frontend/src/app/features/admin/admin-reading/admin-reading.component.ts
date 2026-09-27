import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reading.component.html',
  styleUrls: ['./admin-reading.component.css']
})
export class AdminReadingComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  searchQuery = '';
  filterTag = '';
  filterLevel = '';
  filterPro = '';

  showSlide = false;
  editItem: any = null;
  loading = false;

  formData: any = {
    title: '', videoUrl: '', level: 'B1', category: 'Daily English Conversation',
    tags: [], is_pro: false, enable_dictation: true, enable_shadowing: true,
    duration: '00:00', views: '0', emoji: '🎬', bg: '#dceeff', darkThumb: false
  };

  transcripts: any[] = [];
  tags: string[] = [];
  levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  categories = [
    "Movie short clip", "Daily English Conversation", "Learning resources",
    "Listening Time (Shadowing)", "IELTS Listening", "Entertainment", "Kids",
    "US UK songs", "TOEIC Listening", "VOA Learning English", "BBC learning english",
    "Toefl Listening", "Science and Facts", "Fairy Tales", "Podcast", "IPA",
    "Food & Drink", "Tutorial", "News", "Vietnam Today", "TED", "Travel vlog",
    "Animals and wildlife", "Short Story", "Business English"
  ];

  bgPresets = ["#c8f0d0","#fde8c8","#dceeff","#fff3c4","#f0e0ff","#c4e8ff","#d4f5e0","#ffe4e4","#e4f0ff","#f0ffe4","#ffefd4","#2a2a2a"];

  get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); this.fetchTags(); }

  async fetchItems() {
    this.loading = true;
    try {
      const params = new URLSearchParams();
      if (this.searchQuery) params.set('search', this.searchQuery);
      if (this.filterTag) params.set('tag', this.filterTag);
      if (this.filterLevel) params.set('level', this.filterLevel);
      if (this.filterPro) params.set('pro', this.filterPro);
      const res = await fetch(`http://localhost:5000/api/media-videos?${params}`);
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch { this.items = []; }
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) =>
      !q || i.title?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
    );
  }

  async fetchTags() {
    try {
      const res = await fetch('http://localhost:5000/api/tags');
      const json = await res.json();
      if (json.success) this.tags = json.data.map((t: any) => t.name);
    } catch {}
  }

  parseYoutubeId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  getThumbnail(url: string): string | null {
    const id = this.parseYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  onUrlChange() {
    const id = this.parseYoutubeId(this.formData.videoUrl);
    if (id && !this.editItem) {
      this.formData.youtube_id = id;
    }
  }

  toggleTag(tag: string) {
    const idx = this.formData.tags.indexOf(tag);
    if (idx >= 0) { this.formData.tags.splice(idx, 1); }
    else { this.formData.tags.push(tag); }
  }

  openAdd() {
    this.editItem = null;
    this.formData = {
      title: '', videoUrl: '', level: 'B1', category: 'Daily English Conversation',
      tags: [], is_pro: false, enable_dictation: true, enable_shadowing: true,
      duration: '00:00', views: '0', emoji: '🎬', bg: '#dceeff', darkThumb: false
    };
    this.transcripts = [{ text_en: '', text_vi: '', ipa_data: '' }];
    this.showSlide = true;
  }

  async openEdit(item: any) {
    this.editItem = item;
    this.formData = {
      title: item.title || '',
      videoUrl: item.videoUrl || '',
      level: item.level || 'B1',
      category: item.category || 'Daily English Conversation',
      tags: item.tags ? [...item.tags] : [],
      is_pro: item.pro || false,
      enable_dictation: item.enable_dictation !== false,
      enable_shadowing: item.enable_shadowing !== false,
      duration: item.duration || '00:00',
      views: item.views || '0',
      emoji: item.emoji || '🎬',
      bg: item.bg || '#dceeff',
      darkThumb: item.darkThumb || false
    };
    this.transcripts = [{ text_en: '', text_vi: '', ipa_data: '' }];
    await this.loadTranscripts(item._id);
    this.showSlide = true;
  }

  async loadTranscripts(videoId: string) {
    try {
      const res = await fetch(`http://localhost:5000/api/transcripts/${videoId}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        this.transcripts = json.data.map((t: any) => ({
          _id: t._id,
          text_en: t.text_en || '',
          text_vi: t.text_vi || '',
          ipa_data: typeof t.ipa_data === 'object' ? JSON.stringify(t.ipa_data) : (t.ipa_data || '')
        }));
      }
    } catch {}
  }

  addTranscriptRow() {
    this.transcripts.push({ text_en: '', text_vi: '', ipa_data: '' });
  }

  removeTranscriptRow(idx: number) {
    this.transcripts.splice(idx, 1);
  }

  trackByIndex(i: number) { return i; }

  moveTranscript(idx: number, dir: number) {
    const to = idx + dir;
    if (to < 0 || to >= this.transcripts.length) return;
    [this.transcripts[idx], this.transcripts[to]] = [this.transcripts[to], this.transcripts[idx]];
  }

  onTranscriptKeydown(e: KeyboardEvent, idx: number) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (idx === this.transcripts.length - 1) {
        this.addTranscriptRow();
      }
    }
  }

  async save() {
    if (!this.formData.title) { alert('Vui lòng nhập tiêu đề'); return; }
    this.loading = true;
    try {
      const body = {
        title: this.formData.title,
        videoUrl: this.formData.videoUrl,
        level: this.formData.level,
        category: this.formData.category,
        tags: this.formData.tags,
        pro: this.formData.is_pro,
        enable_dictation: this.formData.enable_dictation,
        enable_shadowing: this.formData.enable_shadowing,
        duration: this.formData.duration,
        views: this.formData.views,
        emoji: this.formData.emoji,
        bg: this.formData.bg,
        darkThumb: this.formData.darkThumb
      };

      let videoId = this.editItem?._id;
      let res: Response;
      if (this.editItem) {
        res = await fetch(`http://localhost:5000/api/media-videos/${videoId}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(body)
        });
      } else {
        res = await fetch('http://localhost:5000/api/media-videos', {
          method: 'POST', headers: this.headers, body: JSON.stringify(body)
        });
      }
      const json = await res.json();
      if (!json.success) { alert('Lỗi: ' + (json.message || '')); this.loading = false; return; }
      videoId = json.data._id;

      // Save transcripts
      const validTranscripts = this.transcripts
        .map((t, i) => ({ text_en: t.text_en, text_vi: t.text_vi, ipa_data: t.ipa_data }))
        .filter(t => t.text_en.trim());
      if (validTranscripts.length > 0) {
        await fetch(`http://localhost:5000/api/transcripts/bulk/${videoId}`, {
          method: 'POST', headers: this.headers, body: JSON.stringify(validTranscripts)
        });
      }

      this.showSlide = false;
      await this.fetchItems();
    } catch (e: any) {
      alert('Lỗi kết nối: ' + e.message);
    }
    this.loading = false;
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa video này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/media-videos/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }

  getBgLabel(bg: string): string {
    const map: Record<string, string> = {
      '#c8f0d0': 'Xanh lá nhạt', '#fde8c8': 'Cam nhạt', '#dceeff': 'Xanh dương nhạt',
      '#fff3c4': 'Vàng nhạt', '#f0e0ff': 'Tím nhạt', '#c4e8ff': 'Xanh biển',
      '#d4f5e0': 'Bạc hà', '#ffe4e4': 'Hồng nhạt', '#e4f0ff': 'Xanh nhạt',
      '#f0ffe4': 'Vàng chanh', '#ffefd4': 'Đào', '#2a2a2a': 'Tối'
    };
    return map[bg] || bg;
  }
}
