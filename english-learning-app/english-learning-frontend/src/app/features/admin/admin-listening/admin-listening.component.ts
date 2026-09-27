import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-listening',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-listening.component.html',
  styleUrls: ['./admin-listening.component.css']
})
export class AdminListeningComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  filteredItems: any[] = [];
  showModal = false;
  editItem: any = null;
  formData: any = { title: '', audio_type: 'url', audio_url: '', level: '', subtitle: '', transcript: '' };
  loading = false;
  uploading = false;
  audioSrc: string | null = null;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() { this.fetchItems(); }

  playAudio(event: Event, item: any) {
    event.stopPropagation();
    const url = this.getAudioUrl(item);
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/listening');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) =>
      !q || i.title?.toLowerCase().includes(q) || i.level?.toLowerCase().includes(q)
    );
  }

  getAudioUrl(item: any): string {
    if (item.audio_type === 'uploaded') return 'http://localhost:5000' + item.audio_url;
    return item.audio_url || '';
  }

  openAdd() {
    this.editItem = null;
    this.formData = { title: '', audio_type: 'url', audio_url: '', level: '', subtitle: '', transcript: '' };
    this.audioSrc = null;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.editItem = item;
    this.formData = {
      title: item.title || '',
      audio_type: item.audio_type || 'url',
      audio_url: item.audio_url || '',
      level: item.level || '',
      subtitle: item.subtitle || '',
      transcript: item.transcript || ''
    };
    this.audioSrc = item.audio_url ? this.getAudioUrl(item) : null;
    this.showModal = true;
  }

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploading = true;
    const formData = new FormData();
    formData.append('audio', file);
    try {
      const res = await fetch('http://localhost:5000/api/listening/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        this.formData.audio_url = json.data.url;
        this.formData.audio_filename = json.data.filename;
        this.formData.audio_type = 'uploaded';
        this.audioSrc = 'http://localhost:5000' + json.data.url;
      } else {
        alert('Upload thất bại: ' + (json.message || ''));
      }
    } catch (e: any) {
      alert('Lỗi upload: ' + e.message);
    }
    this.uploading = false;
  }

  onUrlChange() {
    if (this.formData.audio_type === 'url') {
      this.audioSrc = this.formData.audio_url || null;
    }
  }

  setAudioType(type: string) {
    this.formData.audio_type = type;
    this.audioSrc = null;
    if (type === 'url') {
      this.audioSrc = this.formData.audio_url || null;
    }
  }

  clearAudio() {
    this.formData.audio_url = '';
    this.formData.audio_filename = '';
    this.audioSrc = null;
  }

  async save() {
    this.loading = true;
    try {
      const body: any = {
        title: this.formData.title,
        level: this.formData.level,
        subtitle: this.formData.subtitle,
        transcript: this.formData.transcript,
        questions_json: [],
        audio_type: this.formData.audio_type,
        audio_url: this.formData.audio_url
      };
      if (this.formData.audio_filename) {
        body.audio_filename = this.formData.audio_filename;
      }
      if (this.editItem) {
        await fetch(`http://localhost:5000/api/listening/${this.editItem._id}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(body)
        });
      } else {
        await fetch('http://localhost:5000/api/listening', {
          method: 'POST', headers: this.headers, body: JSON.stringify(body)
        });
      }
      this.showModal = false;
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa bài listening này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/listening/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }
}
