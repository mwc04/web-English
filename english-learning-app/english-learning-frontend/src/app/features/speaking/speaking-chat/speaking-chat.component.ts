import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

const API_BASE = environment.apiUrl;

interface Message {
  role: 'ai' | 'user';
  text: string;
  time: string;
  score?: number;
}

interface SavedConversation {
  id: string;
  title: string;
  topic: string;
  topicLabel: string;
  messages: Message[];
  timestamp: number;
  messageCount: number;
}

@Component({
  selector: 'app-speaking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './speaking-chat.component.html',
  styleUrls: ['./speaking-chat.component.css']
})
export class SpeakingChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef;

  // State
  messages: Message[] = [];
  textInput = '';
  inputMode: 'keyboard' | 'mic' = 'keyboard';
  isTyping = false;
  isListening = false;
  isAiSpeaking = false;
  showHint = false;
  currentTranscript = '';
  selectedTopic = 'daily';
  currentHint = '';
  continuousMode = false;
  showHistory = false;
  savedConversations: SavedConversation[] = [];
  grammarFeedback: { original: string; corrected: string; note: string } | null = null;
  showGrammarPanel = false;

  private topicLabels: Record<string, string> = {
    daily: 'Giao tiếp hàng ngày',
    work: 'Môi trường công việc',
    travel: 'Du lịch & Khách sạn',
    academic: 'Học thuật & Thuyết trình',
    ielts: 'IELTS Speaking Part 1',
    ielts2: 'IELTS Speaking Part 2',
    toeic: 'TOEIC Speaking',
  };

  // Web Speech API
  private recognition: any;
  private synth: SpeechSynthesis | null = null;
  private shouldScroll = false;
  private recognitionRestartPending = false;
  private transcriptBuffer = '';
  private interimText = '';
  private silenceTimer: any = null;
  private readonly SILENCE_TIMEOUT = 5000;

  // Topic starters
  private topicStarters: Record<string, string[]> = {
    daily: [
      "Chào bạn hôm nay của bạn như nào ?",
      "Hello! How are you doing today? Tell me about your day!",
      "Let's talk about your daily routine. What do you usually do in the morning?"
    ],
    work: [
      "Tell me about your job or the career you're interested in.",
      "What do you think are the most important skills in the modern workplace?",
      "Describe your ideal work environment."
    ],
    travel: [
      "Have you ever traveled abroad? Tell me about your experience!",
      "What is your dream travel destination and why?",
      "Describe a memorable trip you've taken."
    ],
    academic: [
      "What subject do you find most challenging and why?",
      "How do you prepare for important presentations?",
      "Tell me about a topic you are passionate about."
    ],
    ielts: [
      "IELTS Part 1: Let's start with some questions about yourself. Do you work or study?",
      "IELTS Part 1: What do you like to do in your free time?",
      "IELTS Part 1: Describe the area where you live."
    ],
    ielts2: [
      "IELTS Part 2: Describe a person who has influenced you greatly. You have 1 minute to prepare.",
      "IELTS Part 2: Talk about a book or film that made a strong impression on you.",
      "IELTS Part 2: Describe a time when you helped someone."
    ],
    toeic: [
      "TOEIC Speaking: Please read the following sentence aloud...",
      "TOEIC: Describe the picture in front of you in detail.",
      "TOEIC: Respond to the questions below as if you are talking on the telephone."
    ]
  };

  private hints: Record<string, string> = {
    daily: "Gợi ý: Sử dụng Present Simple để mô tả thói quen. VD: 'I usually wake up at 7am and then I...' Hãy thêm chi tiết về cảm xúc và suy nghĩ của bạn.",
    work: "Gợi ý: Dùng 'I work as a...' hoặc 'I'm interested in...'. Mô tả kỹ năng bạn có: 'I'm good at... / I'm experienced in...'",
    travel: "Gợi ý: Dùng Past Simple cho chuyến đi đã qua: 'I visited... / It was... / I enjoyed...'. Thêm cảm nhận: 'What impressed me most was...'",
    academic: "Gợi ý: 'In my opinion...' / 'I believe that...' / 'From my perspective...'. Đưa ra ví dụ cụ thể để hỗ trợ ý kiến của bạn.",
    ielts: "IELTS Tip: Câu trả lời Part 1 nên khoảng 2-3 câu. Trả lời trực tiếp câu hỏi rồi thêm chi tiết hoặc lý do.",
    ielts2: "IELTS Tip: Part 2 nên nói 1.5-2 phút. Dùng notes để tổ chức ý: WHO/WHAT, WHEN/WHERE, HOW, WHY this is memorable.",
    toeic: "TOEIC Tip: Nói rõ ràng, tốc độ vừa phải. Dùng từ nối như 'First...', 'Also...', 'Finally...' để trả lời có cấu trúc.",
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private learningTracker: LearningTrackerService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.synth = window.speechSynthesis;
    }
  }

  ngOnInit() {
    this.loadHistory();
    this.sendAIGreeting();
    this.currentHint = this.hints[this.selectedTopic];
    this.learningTracker.startTracking('speaking');
  }

  ngOnDestroy() {
    this.stopListening();
    this.synth?.cancel();
    this.learningTracker.endSession().subscribe();
  }

  // ===== HISTORY =====
  private loadHistory() {
    try {
      const data = localStorage.getItem('speaking_history');
      this.savedConversations = data ? JSON.parse(data) : [];
    } catch { this.savedConversations = []; }
  }

  private saveToHistory() {
    if (this.messages.length < 2) return;
    const title = this.messages[1]?.text?.slice(0, 60) || 'Cuộc hội thoại';
    const existing = this.savedConversations.find(c =>
      c.topic === this.selectedTopic &&
      c.messages.length === this.messages.length &&
      c.messages[0]?.text === this.messages[0]?.text
    );
    const entry: SavedConversation = {
      id: existing?.id || Date.now().toString(),
      title,
      topic: this.selectedTopic,
      topicLabel: this.topicLabels[this.selectedTopic] || this.selectedTopic,
      messages: JSON.parse(JSON.stringify(this.messages)),
      timestamp: Date.now(),
      messageCount: this.messages.length,
    };
    if (existing) {
      Object.assign(existing, entry);
    } else {
      this.savedConversations.unshift(entry);
    }
    localStorage.setItem('speaking_history', JSON.stringify(this.savedConversations));
  }

  toggleHistory() { this.showHistory = !this.showHistory; }

  loadConversation(conv: SavedConversation) {
    this.continuousMode = false;
    this.stopListening();
    this.synth?.cancel();
    this.isAiSpeaking = false;
    this.selectedTopic = conv.topic;
    this.currentHint = this.hints[this.selectedTopic];
    this.messages = JSON.parse(JSON.stringify(conv.messages));
    this.showHistory = false;
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    this.savedConversations = this.savedConversations.filter(c => c.id !== id);
    localStorage.setItem('speaking_history', JSON.stringify(this.savedConversations));
  }

  get conversationCount(): number { return this.savedConversations.length; }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    try {
      const el = this.chatBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private getNow(): string {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  private addMessage(msg: Message) {
    this.messages.push(msg);
    this.cdr.detectChanges();
  }

  private sendAIGreeting() {
    const starters = this.topicStarters[this.selectedTopic] || this.topicStarters['daily'];
    const greeting = starters[Math.floor(Math.random() * starters.length)];
    setTimeout(() => {
      this.pushAI(greeting);
    }, 600);
  }

  private pushAI(text: string) {
    this.isTyping = true;
    this.shouldScroll = true;
    setTimeout(() => {
      this.isTyping = false;
      this.addMessage({ role: 'ai', text, time: this.getNow() });
      this.shouldScroll = true;
      this.saveToHistory();
      this.speakText(text);
    }, 1200 + Math.random() * 600);
  }

  sendText() {
    const txt = this.textInput.trim();
    if (!txt || this.isTyping) return;
    this.addMessage({ role: 'user', text: txt, time: this.getNow() });
    this.textInput = '';
    this.shouldScroll = true;
    this.checkGrammar(txt);
    this.getAIResponse(txt);
  }

  private async getAIResponse(userText: string) {
    this.isTyping = true;
    this.shouldScroll = true;

    const topicLabels: Record<string, string> = {
      daily: 'daily life & routines',
      work: 'work & career',
      travel: 'travel & hospitality',
      academic: 'academic & presentations',
      ielts: 'IELTS Speaking Part 1',
      ielts2: 'IELTS Speaking Part 2',
      toeic: 'TOEIC Speaking',
    };

    const conversation = this.messages.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`
    ).join('\n');

    const prompt = `You are a friendly native English speaker having a casual chat. Your role:
- Topic: ${topicLabels[this.selectedTopic] || 'daily life'}
- Reply naturally like a real person, NOT like a tutor
- NO grammar/vocabulary feedback — just chat
- Keep it simple (CEFR A2-B1 level)
- React with emotion and personality
- Ask questions naturally when it fits
- No formulaic phrases, no "Great job!", no ratings

Conversation so far:
${conversation}
User: ${userText}
You:`;

    try {
      const res = await fetch(`${API_BASE}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error('Gemini backend error:', json.message);
        throw new Error(json.message || 'API error');
      }

      const reply = json.data.reply || "Hmm, say that again?";

      const score = Math.min(10, Math.max(5, Math.floor(7 + Math.random() * 3)));

      this.isTyping = false;
      this.addMessage({ role: 'ai', text: reply, time: this.getNow(), score });
      this.shouldScroll = true;
      this.saveToHistory();
      this.speakText(reply);
    } catch (e) {
      console.error('Gemini API call failed:', e);
      this.isTyping = false;
      const fallback = "Hmm, say that again?";
      this.addMessage({ role: 'ai', text: fallback, time: this.getNow(), score: 7 });
      this.shouldScroll = true;
      this.saveToHistory();
      this.speakText(fallback);
    }
  }

  checkGrammar(text: string) {
    this.grammarFeedback = null;
    this.showGrammarPanel = true;
    const prompt = `You are an English grammar tutor. Fix the user's English sentence. Return ONLY valid JSON (no markdown), exactly: {"corrected":"...","note":"..."}. "corrected" is the corrected sentence. "note" is 1-2 sentences in Vietnamese explaining the fix. Sentence: "${text}"`;

    fetch(`${API_BASE}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        let raw = json.data.reply.trim();
        const match = raw.match(/\{.*\}/s);
        if (match) raw = match[0];
        const parsed = JSON.parse(raw);
        this.grammarFeedback = {
          original: text,
          corrected: parsed.corrected || text,
          note: parsed.note || 'Không có ghi chú.'
        };
      })
      .catch(() => {
        this.grammarFeedback = {
          original: text,
          corrected: text,
          note: 'Câu của bạn không có lỗi ngữ pháp rõ ràng.'
        };
      });
  }

  getAdvancedFeedback() {
    if (!this.grammarFeedback) return;
    const text = this.grammarFeedback.original;
    const prompt = `You are an English grammar tutor. Give detailed advanced feedback in Vietnamese for this sentence. Include: 1) Grammar errors, 2) Vocabulary suggestions, 3) Alternative ways to say it, 4) CEFR level assessment.

Sentence: "${text}"`;

    fetch(`${API_BASE}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        this.grammarFeedback!.note = json.data.reply;
      })
      .catch(() => {});
  }

  speakText(text: string) {
    if (!this.synth) return;
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    utter.pitch = 1.05;
    utter.onstart = () => { this.isAiSpeaking = true; };
    utter.onend = () => {
      this.isAiSpeaking = false;
      if (this.continuousMode && !this.recognitionRestartPending) {
        this.recognitionRestartPending = true;
        setTimeout(() => {
          this.recognitionRestartPending = false;
          if (this.continuousMode) this.startListening();
        }, 400);
      }
    };
    utter.onerror = () => { this.isAiSpeaking = false; };
    this.synth.speak(utter);
  }

  // ===== MIC =====
  private createRecognition(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('SpeechRecognition not supported in this browser.');
      return null;
    }
    const recog = new SR();
    recog.lang = 'en-US';
    recog.continuous = true;
    recog.interimResults = true;

    recog.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const t = event.results[i][0].transcript.trim();
          if (t) {
            this.transcriptBuffer += (this.transcriptBuffer ? ' ' : '') + t;
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      this.interimText = interim;
      this.currentTranscript = this.transcriptBuffer + (interim ? ' ' + interim : '');
      this.cdr.detectChanges();
    };
    recog.onerror = (e: any) => {
      console.warn('SpeechRecognition error:', e.error);
      this.isListening = false;
    };
    recog.onend = () => {
      if (this.transcriptBuffer) this.processTranscript();
      if (this.continuousMode && !this.recognitionRestartPending) {
        this.recognitionRestartPending = true;
        setTimeout(() => {
          this.recognitionRestartPending = false;
          if (this.continuousMode) this.startListening();
        }, 300);
      }
      this.isListening = false;
    };
    return recog;
  }

  private startListening() {
    if (this.isListening || this.isAiSpeaking) return;
    try {
      this.recognition = this.createRecognition();
      if (!this.recognition) {
        alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome trên desktop.');
        return;
      }
      this.recognition.start();
      this.isListening = true;
      this.inputMode = 'mic';
    } catch (e) {
      console.warn('Failed to start recognition:', e);
      this.isListening = false;
    }
  }

  private processTranscript() {
    clearTimeout(this.silenceTimer);
    const text = this.transcriptBuffer.trim();
    this.transcriptBuffer = '';
    this.interimText = '';
    this.currentTranscript = '';
    if (!text) return;
    this.addMessage({ role: 'user', text, time: this.getNow() });
    this.shouldScroll = true;
    this.checkGrammar(text);
    this.getAIResponse(text);
  }

  private stopListening() {
    clearTimeout(this.silenceTimer);
    try { this.recognition?.stop(); } catch {}
    if (this.transcriptBuffer) this.processTranscript();
    this.isListening = false;
  }

  toggleMic() {
    if (this.isListening || this.continuousMode) {
      this.continuousMode = false;
      this.stopListening();
      this.synth?.cancel();
      this.isAiSpeaking = false;
      this.recognitionRestartPending = false;
    } else {
      this.synth?.cancel();
      this.isAiSpeaking = false;
      this.continuousMode = true;
      this.startListening();
    }
  }

  setMode(mode: 'keyboard' | 'mic') { this.inputMode = mode; }

  toggleHint() {
    this.showHint = !this.showHint;
    this.currentHint = this.hints[this.selectedTopic] || this.hints['daily'];
  }

  onTopicChange() {
    this.continuousMode = false;
    this.stopListening();
    this.synth?.cancel();
    this.isAiSpeaking = false;
    this.currentHint = this.hints[this.selectedTopic];
    this.messages = [];
    this.sendAIGreeting();
  }

  clearChat() {
    this.continuousMode = false;
    this.stopListening();
    this.synth?.cancel();
    this.isAiSpeaking = false;
    this.messages = [];
  }

  navigate(path: string) { this.router.navigate([path]); }
}
