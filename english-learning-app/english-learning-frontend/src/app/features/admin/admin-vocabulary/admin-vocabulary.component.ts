import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const CATEGORIES = ['Du lịch', 'Công nghệ', 'Sức khỏe', 'Ẩm thực', 'Thiên nhiên', 'Kinh doanh', 'Giáo dục', 'Thể thao', 'Nghệ thuật', 'General'];

@Component({
  selector: 'app-admin-vocabulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-vocabulary.component.html',
  styleUrls: ['./admin-vocabulary.component.css']
})
export class AdminVocabularyComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  categoryFilter = '';
  filteredItems: any[] = [];
  showModal = false;
  editItem: any = null;
  formData = { word: '', meaning: '', example: '', category: 'General' };
  loading = false;
  categories = CATEGORIES;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/vocabularies');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) => {
      const matchSearch = !q || i.word?.toLowerCase().includes(q) || i.meaning?.toLowerCase().includes(q);
      const matchCategory = !this.categoryFilter || i.category === this.categoryFilter;
      return matchSearch && matchCategory;
    });
  }

  openAdd() {
    this.editItem = null;
    this.formData = { word: '', meaning: '', example: '', category: 'General' };
    this.showModal = true;
  }

  openEdit(item: any) {
    this.editItem = item;
    this.formData = {
      word: item.word,
      meaning: item.meaning,
      example: item.example || '',
      category: item.category || 'General'
    };
    this.showModal = true;
  }

  async save() {
    this.loading = true;
    try {
      if (this.editItem) {
        await fetch(`http://localhost:5000/api/vocabularies/${this.editItem._id}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(this.formData)
        });
      } else {
        await fetch('http://localhost:5000/api/vocabularies', {
          method: 'POST', headers: this.headers, body: JSON.stringify(this.formData)
        });
      }
      this.showModal = false;
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa từ vựng này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/vocabularies/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }
}
