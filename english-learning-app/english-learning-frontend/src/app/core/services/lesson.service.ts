import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  level: string;
  image_url: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Lesson[] }> {
    return this.http.get<{ success: boolean; data: Lesson[] }>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; data: Lesson }> {
    return this.http.get<{ success: boolean; data: Lesson }>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Lesson>): Observable<{ success: boolean; data: Lesson }> {
    return this.http.post<{ success: boolean; data: Lesson }>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Lesson>): Observable<{ success: boolean; data: Lesson }> {
    return this.http.put<{ success: boolean; data: Lesson }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
