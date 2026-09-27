import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tags.component.html',
  styleUrls: ['./admin-tags.component.css']
})
export class AdminTagsComponent implements OnInit {
  tags: any[] = [];
  newTag = { name: '', slug: '', icon: '📺' };
  loading = false;

  get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchTags(); }

  async fetchTags() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/tags');
      const json = await res.json();
      this.tags = json.success ? json.data : [];
    } catch { this.tags = []; }
    this.loading = false;
  }

  autoSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async addTag() {
    if (!this.newTag.name.trim()) return;
    this.loading = true;
    try {
      const body = {
        name: this.newTag.name,
        slug: this.newTag.slug || this.autoSlug(this.newTag.name),
        icon: this.newTag.icon || '📺',
        display_order: this.tags.length
      };
      const res = await fetch('http://localhost:5000/api/tags', {
        method: 'POST', headers: this.headers, body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        this.newTag = { name: '', slug: '', icon: '📺' };
        await this.fetchTags();
      } else {
        alert('Lỗi: ' + (json.message || ''));
      }
    } catch {}
    this.loading = false;
  }

  async saveTag(tag: any) {
    try {
      await fetch(`http://localhost:5000/api/tags/${tag._id}`, {
        method: 'PUT', headers: this.headers,
        body: JSON.stringify({ name: tag.name, slug: tag.slug, icon: tag.icon, display_order: tag.display_order })
      });
    } catch {}
  }

  async deleteTag(id: string) {
    if (!confirm('Xóa tag này?')) return;
    try {
      await fetch(`http://localhost:5000/api/tags/${id}`, { method: 'DELETE', headers: this.headers });
      await this.fetchTags();
    } catch {}
  }

  moveTag(idx: number, dir: number) {
    const to = idx + dir;
    if (to < 0 || to >= this.tags.length) return;
    [this.tags[idx], this.tags[to]] = [this.tags[to], this.tags[idx]];
    this.tags.forEach((t, i) => t.display_order = i);
    // Save new order
    this.tags.forEach(t => this.saveTag(t));
  }
}
