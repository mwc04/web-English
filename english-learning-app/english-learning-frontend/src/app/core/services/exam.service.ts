import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  total_questions: number;
  duration_minutes: number;
  createdAt: string;
}

export interface BackendQuestion {
  id: string;
  part: number | null;
  question_type: string;
  instruction: string;
  question_text: string;
  options_json: string[];
  passage?: string;
  audio_url?: string;
  image_url?: string;
  group_label?: string;
  sub_questions?: BackendSubQuestion[];
}

export interface BackendSubQuestion {
  id: string;
  question_text: string;
  options_json: string[];
  instruction?: string;
}

export interface TestDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  total_questions: number;
}

export interface TestDetailResponse {
  test: TestDetail;
  questions: BackendQuestion[];
  examType?: 'standard' | 'structured';
  content?: any;
}

export interface SubmitResult {
  score: number;
  correct_answers: number;
  total_questions: number;
  result_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/tests`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Test[] }> {
    return this.http.get<{ success: boolean; data: Test[] }>(`${this.apiUrl}?category=${this.getCategoryParam()}`);
  }

  getByCategory(category: string): Observable<{ success: boolean; data: Test[] }> {
    return this.http.get<{ success: boolean; data: Test[] }>(`${this.apiUrl}?category=${category}`);
  }

  getQuestions(testId: string): Observable<{ success: boolean; data: TestDetailResponse }> {
    return this.http.get<{ success: boolean; data: TestDetailResponse }>(`${this.apiUrl}/${testId}/questions`);
  }

  submit(testId: string, answers: { questionId: string; userAnswer: string }[], timeSpent?: number): Observable<{ success: boolean; data: SubmitResult }> {
    return this.http.post<{ success: boolean; data: SubmitResult }>(`${this.apiUrl}/${testId}/submit`, { answers, time_spent: timeSpent });
  }

  private getCategoryParam(): string {
    return '';
  }
}
