import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { filter } from 'rxjs';
import { LearningTrackerService } from './core/services/learning-tracker.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  isAdminRoute = false;

  constructor(
    private router: Router,
    private learningTracker: LearningTrackerService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
      this.learningTracker.trackByRoute(event.urlAfterRedirects);
    });

    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.learningTracker.trackByRoute(this.router.url);
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }
}
