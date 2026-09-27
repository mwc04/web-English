import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(private router: Router) {}

  goToVocabulary() { this.router.navigate(['/vocabulary']); }
  goToGrammar() { this.router.navigate(['/grammar']); }
  goToListening() { this.router.navigate(['/listening']); }
  goToReading() { this.router.navigate(['/reading']); }
  goToExam() { this.router.navigate(['/exams']); }
}
