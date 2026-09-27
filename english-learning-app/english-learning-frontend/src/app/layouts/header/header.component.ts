import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  get isLoggedIn() { return this.authService.isLoggedIn(); }
  user: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const res = await this.authService.getMe().toPromise();
      if (res?.success && res.data) {
        this.user = res.data;
      }
    } catch (e) {
      this.user = null;
    }
  }

  goToHome() { this.router.navigate(['/home']); }
  goToLogin() { this.router.navigate(['/login']); }
  goToProfile() { this.router.navigate(['/profile']); }
  goToVocabulary() { this.router.navigate(['/vocabulary']); }
  goToGrammar() { this.router.navigate(['/grammar']); }
  goToListening() { this.router.navigate(['/listening']); }
  goToReading() { this.router.navigate(['/reading']); }
  goToSpeaking() { this.router.navigate(['/speaking']); }
  goToWriting() { this.router.navigate(['/writing']); }
  goToExam() { this.router.navigate(['/exams']); }
  goToHistory() { this.router.navigate(['/history']); }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/home']);
  }
}
