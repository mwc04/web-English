import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReadingExercise {
  _id: string;
  title: string;
  content: string;
  level: string;
  questions: {
    question_text: string;
    options: string[];
    correct_answer: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReadingService {
  private apiUrl = `${environment.apiUrl}/reading`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: ReadingExercise[] }> {
    return this.http.get<{ success: boolean; data: ReadingExercise[] }>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; data: ReadingExercise }> {
    return this.http.get<{ success: boolean; data: ReadingExercise }>(`${this.apiUrl}/${id}`);
  }
}
