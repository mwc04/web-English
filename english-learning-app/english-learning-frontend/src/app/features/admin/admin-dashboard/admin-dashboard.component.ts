import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { label: 'Video', count: 0, icon: '🎬', bg: '#e3f2fd', link: '/admin/reading' },
    { label: 'Tag / Chủ đề', count: 0, icon: '🏷️', bg: '#e8f5e9', link: '/admin/tags' },
    { label: 'Từ vựng', count: 0, icon: '📝', bg: '#fff3e0', link: '/admin/vocabulary' },
    { label: 'Ngữ pháp', count: 0, icon: '📚', bg: '#f3e5f5', link: '/admin/grammar' },
    { label: 'Bài kiểm tra', count: 0, icon: '📋', bg: '#fce4ec', link: '/admin/tests' },
    { label: 'Người dùng', count: 0, icon: '👥', bg: '#e0f7fa', link: '/admin/users' },
  ];

  recentVideos: any[] = [];

  quickLinks = [
    { label: 'Thêm video', icon: '🎬', link: '/admin/reading' },
    { label: 'Thêm tag', icon: '🏷️', link: '/admin/tags' },
    { label: 'Thêm từ vựng', icon: '📝', link: '/admin/vocabulary' },
    { label: 'Quản lý người dùng', icon: '👥', link: '/admin/users' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchStats();
  }

  goToAdd() {
    this.router.navigate(['/admin/vocabulary']);
  }

  refresh() {
    this.fetchStats();
  }

  private async fetchStats() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const base = 'http://localhost:5000/api';

    try {
      const responses = await Promise.all([
        fetch(`${base}/media-videos`),
        fetch(`${base}/tags`),
        fetch(`${base}/vocabularies`, { headers }),
        fetch(`${base}/grammar`, { headers }),
        fetch(`${base}/tests`, { headers }),
        fetch(`${base}/users`, { headers }),
      ]);

      const counts = await Promise.all(
        responses.map(async (r: Response) => {
          const j = await r.json();
          return (j.data || []).length;
        })
      );

      this.stats.forEach((s, i) => s.count = counts[i]);
      this.stats = [...this.stats];

      // 5 videos gần nhất
      const vidRes = await fetch(`${base}/media-videos`);
      const vidJson = await vidRes.json();
      this.recentVideos = (vidJson.data || []).slice(0, 5);
    } catch {}
  }
}
