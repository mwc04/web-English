import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeakingService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<{ success: boolean; data: { reply: string } }> {
    return this.http.post<{ success: boolean; data: { reply: string } }>(`${this.apiUrl}/message`, { message });
  }

  getSessions(): Observable<{ success: boolean; data: ChatSession[] }> {
    return this.http.get<{ success: boolean; data: ChatSession[] }>(`${this.apiUrl}/sessions`);
  }

  getHistory(sessionId: string): Observable<{ success: boolean; data: ChatSession }> {
    return this.http.get<{ success: boolean; data: ChatSession }>(`${this.apiUrl}/history/${sessionId}`);
  }
}
