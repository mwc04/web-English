import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const CATEGORIES = [
  { key: 'toeic', label: 'TOEIC' },
  { key: 'thpt', label: 'THPT Quốc gia' },
  { key: 'ielts', label: 'IELTS' },
  { key: 'general', label: 'Tổng hợp' },
];

const TEST_TYPES = [
  { key: 'full_test', label: 'Full Test' },
  { key: 'mini_test', label: 'Mini Test' },
  { key: 'part_practice', label: 'Part Practice' },
];

@Component({
  selector: 'app-admin-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tests.component.html',
  styleUrls: ['./admin-tests.component.css']
})
export class AdminTestsComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  filteredItems: any[] = [];
  showModal = false;
  editItem: any = null;
  formData = {
    title: '',
    description: '',
    category: 'toeic',
    type: 'full_test',
    total_questions: 200,
    duration_minutes: 120
  };
  loading = false;
  categories = CATEGORIES;
  testTypes = TEST_TYPES;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/tests');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) =>
      !q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    );
  }

  openAdd() {
    this.editItem = null;
    this.formData = { title: '', description: '', category: 'toeic', type: 'full_test', total_questions: 200, duration_minutes: 120 };
    this.showModal = true;
  }

  openEdit(item: any) {
    this.editItem = item;
    this.formData = {
      title: item.title,
      description: item.description || '',
      category: item.category || 'toeic',
      type: item.type || 'full_test',
      total_questions: item.total_questions || 200,
      duration_minutes: item.duration_minutes || 120
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async save() {
    if (!this.formData.title || !this.formData.total_questions || !this.formData.duration_minutes) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    this.loading = true;
    try {
      if (this.editItem) {
        await fetch(`http://localhost:5000/api/tests/${this.editItem._id}`, {
          method: 'PUT', headers: this.headers, body: JSON.stringify(this.formData)
        });
      } else {
        await fetch('http://localhost:5000/api/tests', {
          method: 'POST', headers: this.headers, body: JSON.stringify(this.formData)
        });
      }
      this.showModal = false;
      await this.fetchItems();
    } catch (e) {
      alert('Lỗi khi lưu: ' + e);
    }
    this.loading = false;
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa bài test này? Các câu hỏi và kết quả liên quan cũng sẽ bị xóa.')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/tests/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch (e) {
      alert('Lỗi khi xóa: ' + e);
    }
    this.loading = false;
  }
}
