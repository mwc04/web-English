import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GrammarRule {
  _id: string;
  title: string;
  description: string;
  content: string;
  examples: { sentence: string; translation: string }[];
  level: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  private apiUrl = `${environment.apiUrl}/grammar`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: GrammarRule[] }> {
    return this.http.get<{ success: boolean; data: GrammarRule[] }>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; data: GrammarRule }> {
    return this.http.get<{ success: boolean; data: GrammarRule }>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<GrammarRule>): Observable<{ success: boolean; data: GrammarRule }> {
    return this.http.post<{ success: boolean; data: GrammarRule }>(this.apiUrl, data);
  }
}
