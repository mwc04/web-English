import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vocabulary {
  _id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  lesson_id: string;
  image_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private apiUrl = `${environment.apiUrl}/vocabularies`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Vocabulary[] }> {
    return this.http.get<{ success: boolean; data: Vocabulary[] }>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; data: Vocabulary }> {
    return this.http.get<{ success: boolean; data: Vocabulary }>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Vocabulary>): Observable<{ success: boolean; data: Vocabulary }> {
    return this.http.post<{ success: boolean; data: Vocabulary }>(this.apiUrl, data);
  }
}
