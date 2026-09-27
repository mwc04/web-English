import { Component, ViewEncapsulation  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] ,
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  constructor(private router: Router) {}

  // Chuyển hướng đến trang đăng ký
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Chuyển hướng đến trang đăng nhập
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Chuyển hướng đến trang từ vựng
  goToVocabulary() {
    this.router.navigate(['/vocabulary']);
  }

  // Chuyển hướng đến trang ngữ pháp
  goToGrammar() {
    this.router.navigate(['/grammar']);
  }

  // Chuyển hướng đến trang luyện nghe
  goToListening() {
    this.router.navigate(['/listening']);
  }

  // Chuyển hướng đến trang luyện đọc
  goToReading() {
    this.router.navigate(['/reading']);
  }

  // Chuyển hướng đến trang luyện nói
  goToSpeaking() {
    this.router.navigate(['/speaking']);
  }

  // Chuyển hướng đến trang luyện viết
  goToWriting() {
    this.router.navigate(['/writing']);
  }

  // Chuyển hướng đến trang thi thử
  goToExam() {
    this.router.navigate(['/exams']);
  }
}