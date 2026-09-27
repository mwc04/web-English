import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';
  filteredItems: any[] = [];
  loading = false;

  private get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit() { this.fetchItems(); }

  async fetchItems() {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const json = await res.json();
      this.items = json.data || [];
      this.applyFilter();
    } catch {}
    this.loading = false;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((i: any) =>
      !q || i.username?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q)
    );
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa người dùng này?')) return;
    this.loading = true;
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE', headers: this.headers
      });
      await this.fetchItems();
    } catch {}
    this.loading = false;
  }
}
