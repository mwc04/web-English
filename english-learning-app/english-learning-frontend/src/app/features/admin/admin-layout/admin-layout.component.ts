import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;

  menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/vocabulary', icon: '📝', label: 'Từ vựng' },
    { path: '/admin/grammar', icon: '📚', label: 'Ngữ pháp' },
    { path: '/admin/listening', icon: '🎧', label: 'Luyện nghe' },
    { path: '/admin/reading', icon: '🎬', label: 'Video' },
    { path: '/admin/tags', icon: '🏷️', label: 'Tag / Chủ đề' },
    { path: '/admin/writing', icon: '✍️', label: 'Luyện viết' },
    { path: '/admin/tests', icon: '📋', label: 'Bài kiểm tra' },
    { path: '/admin/users', icon: '👥', label: 'Người dùng' },
  ];

  constructor(private router: Router) {}

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }

  goToHome() { this.router.navigate(['/home']); }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
