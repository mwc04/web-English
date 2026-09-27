import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { placementGuard } from './core/guards/placement.guard';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/profile.component';

// Lesson Components
import { LessonListComponent } from './features/lessons/lesson-list/lesson-list.component';
import { LessonDetailComponent } from './features/lessons/lesson-detail/lesson-detail.component';

// Learning Components
import { VocabularyComponent } from './features/learning/vocabulary/vocabulary.component';
import { VocabularyDetailComponent } from './features/learning/vocabulary/vocabulary-detail/vocabulary-detail.component';
import { GrammarComponent } from './features/learning/grammar/grammar.component';
import { GrammarDetailComponent } from './features/learning/grammar/grammar-detail/grammar-detail.component';
import { ListeningComponent } from './features/learning/listening/listening.component';
import { ListeningDetailComponent } from './features/learning/listening-detail/listening-detail.component';
import { ReadingListComponent } from './features/reading/reading-list/reading-list.component';
import { ReadingShadowingComponent } from './features/reading/reading-shadowing/reading-shadowing.component';
import { SpeakingChatComponent } from './features/speaking/speaking-chat/speaking-chat.component';
import { WritingComponent } from './features/learning/writing/writing.component';

// Exam Components
import { TestListComponent } from './features/exam/test-list/test-list.component';
import { TakeTestComponent } from './features/exam/take-test/take-test.component';
import { TestResultComponent } from './features/exam/test-result/test-result.component';
import { PlacementTestComponent } from './features/exam/placement-test/placement-test.component';

// Result Components
import { HistoryComponent } from './features/results/history/history.component';
import { LearningHistoryComponent } from './features/results/learning-history/learning-history.component';

// Home Component
import { HomeComponent } from './pages/home/home.component';

// Admin Components
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminVocabularyComponent } from './features/admin/admin-vocabulary/admin-vocabulary.component';
import { AdminGrammarComponent } from './features/admin/admin-grammar/admin-grammar.component';
import { AdminListeningComponent } from './features/admin/admin-listening/admin-listening.component';
import { AdminReadingComponent } from './features/admin/admin-reading/admin-reading.component';
import { AdminTagsComponent } from './features/admin/admin-tags/admin-tags.component';
import { AdminWritingComponent } from './features/admin/admin-writing/admin-writing.component';
import { AdminTestsComponent } from './features/admin/admin-tests/admin-tests.component';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users.component';

export const routes: Routes = [
  // Trang chủ
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // Lesson routes
  { path: 'lessons', component: LessonListComponent },
  { path: 'lessons/:id', component: LessonDetailComponent, canActivate: [placementGuard] },

  // Learning routes
  { path: 'vocabulary', component: VocabularyComponent },
  { path: 'vocabulary/:id', component: VocabularyDetailComponent, canActivate: [placementGuard] },
  { path: 'grammar', component: GrammarComponent },
  { path: 'grammar/:id', component: GrammarDetailComponent, canActivate: [placementGuard] },
  { path: 'listening', component: ListeningComponent },
  { path: 'listening/:id', component: ListeningDetailComponent, canActivate: [placementGuard] },
  { path: 'reading', component: ReadingListComponent },
  { path: 'reading/shadowing', component: ReadingShadowingComponent, canActivate: [placementGuard] },
  { path: 'speaking', component: SpeakingChatComponent, canActivate: [placementGuard] },
  { path: 'writing', component: WritingComponent, canActivate: [placementGuard] },

  // Exam routes
  { path: 'exams', component: TestListComponent },
  { path: 'exams/:id/take', component: TakeTestComponent },
  { path: 'exams/:id/result', component: TestResultComponent },
  { path: 'placement-test', component: PlacementTestComponent, canActivate: [authGuard] },

  // Result routes
  { path: 'results', component: HistoryComponent },
  { path: 'history', component: LearningHistoryComponent, canActivate: [authGuard] },

  // Admin routes (cần đăng nhập + quyền admin)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'vocabulary', component: AdminVocabularyComponent },
      { path: 'grammar', component: AdminGrammarComponent },
      { path: 'listening', component: AdminListeningComponent },
      { path: 'reading', component: AdminReadingComponent },
      { path: 'tags', component: AdminTagsComponent },
      { path: 'writing', component: AdminWritingComponent },
      { path: 'tests', component: AdminTestsComponent },
      { path: 'users', component: AdminUsersComponent },
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/home' }
];
