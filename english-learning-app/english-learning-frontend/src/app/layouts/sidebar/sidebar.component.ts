import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  collapsed = false;
  mobileOpen = false;

  navItems: NavItem[] = [
    { label: 'Trang chủ', route: '/home', icon: '🏠' },
    { label: 'Từ vựng', route: '/vocabulary', icon: '📝' },
    { label: 'Ngữ pháp', route: '/grammar', icon: '📚' },
    { label: 'Luyện nghe', route: '/listening', icon: '🎧' },
    { label: 'Luyện đọc', route: '/reading', icon: '📖' },
    { label: 'Luyện nói', route: '/speaking', icon: '🗣️' },
    { label: 'Luyện viết', route: '/writing', icon: '✍️' },
    { label: 'Thi thử', route: '/exams', icon: '📋', badge: 'HOT' },
    { label: 'Kết quả', route: '/results', icon: '📊' },
  ];

  constructor(private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    if (target.innerWidth > 992) {
      this.mobileOpen = false;
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  openMobile() {
    this.mobileOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMobile() {
    this.mobileOpen = false;
    document.body.style.overflow = '';
  }

  onNavClick() {
    if (window.innerWidth <= 992) {
      this.closeMobile();
    }
  }
}