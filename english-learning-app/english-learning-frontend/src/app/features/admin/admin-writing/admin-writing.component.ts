import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-writing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-writing.component.html',
  styleUrls: ['./admin-writing.component.css']
})
export class AdminWritingComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  filteredItems: any[] = [];
  showModal = false;
  editItem: any = null;
  formData = { title: '', topic: '', sample_answer: '' };
  loading = false;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/writing');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) =>
      !q || i.title?.toLowerCase().includes(q) || i.topic?.toLowerCase().includes(q)
    );
  }

  openAdd() {
    this.editItem = null;
    this.formData = { title: '', topic: '', sample_answer: '' };
    this.showModal = true;
  }

  openEdit(item: any) {
    this.editItem = item;
    this.formData = { title: item.title, topic: item.topic, sample_answer: item.sample_answer || '' };
    this.showModal = true;
  }

  async save() {
    this.loading = true;
    try {
      if (this.editItem) {
        await fetch(`http://localhost:5000/api/writing/${this.editItem._id}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(this.formData)
        });
      } else {
        await fetch('http://localhost:5000/api/writing', {
          method: 'POST', headers: this.headers, body: JSON.stringify(this.formData)
        });
      }
      this.showModal = false;
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa bài writing này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/writing/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }
}
