import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TestResult {
  _id: string;
  user_id: string;
  test_id: { _id: string; title: string; description: string };
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  completed_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private apiUrl = `${environment.apiUrl}/results`;

  constructor(private http: HttpClient) {}

  getHistory(): Observable<{ success: boolean; data: TestResult[] }> {
    return this.http.get<{ success: boolean; data: TestResult[] }>(`${this.apiUrl}/history`);
  }

  getById(id: string): Observable<{ success: boolean; data: TestResult }> {
    return this.http.get<{ success: boolean; data: TestResult }>(`${this.apiUrl}/${id}`);
  }
}
