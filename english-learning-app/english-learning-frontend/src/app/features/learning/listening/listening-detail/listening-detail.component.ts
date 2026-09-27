import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DialogueLine {
  speaker: string;
  avatar: string;
  cls: string;
  time: string;
  sec: number;
  en: string;
  vi: string;
  opts: string[];
  ans: number;
}

interface VocabItem {
  word: string;
  mean: string;
}

interface CheckState {
  answered: boolean;
  correct: boolean;
}

interface DictState {
  hidden: number[];
  revealed: number[];
}

@Component({
  selector: 'app-listening-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listening-detail.component.html',
  styleUrls: ['./listening-detail.component.css']
})
export class ListeningDetailComponent implements OnInit, OnDestroy {
  Math = Math;
  letters = ['a', 'b', 'c', 'd', 'e'];
  waveHeights = [18,26,40,33,52,58,46,34,40,50,56,42,28,36,48,60,54,38,26,34,46,54,58,44,30,38,48,42,35,50,56,40,28,36,44,52,58,46,34,40,28,36,50,44,38,52,56,42,32,40,52,46,36,50,58,44,30,38,48,54,60,46,34,42,52,56,40,28,36,46,52,58,44,32,40,48,56,42,30,38,46,54,60,46,34,40,52,56,42,28];
  exercise: any = null;
  loading = false;

  duration = 242;
  currentSec = 0;
  playing = false;
  speed = 1;
  muted = false;
  viewMode: 'both' | 'en' | 'vi' = 'both';
  answeredCount = 0;
  vocabSeenCount = 0;

  animFrameId: number | null = null;
  lastTimestamp: number | null = null;
  dragging = false;

  lines: DialogueLine[] = [];
  vocabs: VocabItem[] = [];
  questions: any[] = [];
  correctAnswers: Record<number, string> = {};
  answered: Record<number, boolean> = {};

  /* mode tabs */
  activeMode: 'full' | 'check' | 'dictation' = 'full';

  /* check mode */
  checkState: Record<number, CheckState> = {};

  /* dictation mode */
  dictIdx = 0;
  hideLevel = 100;
  dictLoop = false;
  dictAnswered: Record<number, DictState> = {};
  dictInput = '';
  dictResultText = '';
  dictResultType: '' | 'ok' | 'err' = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.fetchListening(id);
    });
  }

  ngOnDestroy() {
    this.stopPlayback();
  }

  async fetchListening(id: string) {
    this.loading = true;
    try {
      const res = await fetch(`http://localhost:5000/api/listening/${id}`);
      const json = await res.json();
      if (json.success) {
        this.exercise = json.data;
        this.buildFromExercise();
      } else {
        this.loadDemoData();
      }
    } catch {
      this.loadDemoData();
    }
    this.loading = false;
  }

  private buildFromExercise() {
    const ex = this.exercise;
    this.duration = ex.duration || 242;
    if (ex.dialogue && Array.isArray(ex.dialogue)) {
      this.lines = ex.dialogue;
    } else {
      this.loadDemoDialogue();
    }
    if (ex.vocabulary && Array.isArray(ex.vocabulary)) {
      this.vocabs = ex.vocabulary;
    } else {
      this.loadDemoVocab();
    }
    if (ex.questions_json && Array.isArray(ex.questions_json)) {
      this.questions = ex.questions_json;
      this.correctAnswers = {};
      this.answered = {};
      const letters = ['a', 'b', 'c', 'd'];
      ex.questions_json.forEach((q: any, i: number) => {
        const idx = q.options?.indexOf(q.correct_answer);
        this.correctAnswers[i + 1] = idx >= 0 ? letters[idx] : 'a';
      });
    }
  }

  private loadDemoDialogue() {
    this.lines = [
      { speaker:'Anna', avatar:'A', cls:'av-a', time:'0:00', sec:0, en:"Good morning! What time do you usually wake up?", vi:"Chào buổi sáng! Bạn thường thức dậy lúc mấy giờ?", opts:["Good morning! What time do you usually wake up?","Hi there! What do you have for breakfast?","Hello! Where do you usually go in the morning?"], ans:0 },
      { speaker:'Ben',  avatar:'B', cls:'av-b', time:'0:08', sec:8, en:"I usually wake up at six thirty. Then I make coffee and check my phone.", vi:"Tôi thường thức dậy lúc sáu rưỡi. Sau đó tôi pha cà phê và xem điện thoại.", opts:["I usually wake up at six thirty. Then I make coffee and check my phone.","I wake up at seven and go for a run before breakfast.","I get up at six and take a shower first."], ans:0 },
      { speaker:'Anna', avatar:'A', cls:'av-a', time:'0:18', sec:18, en:"Do you have breakfast at home or do you eat out?", vi:"Bạn ăn sáng ở nhà hay ăn ngoài?", opts:["Do you have breakfast at home or do you eat out?","Do you cook dinner every night?","Where do you usually have lunch?"], ans:0 },
      { speaker:'Ben',  avatar:'B', cls:'av-b', time:'0:25', sec:25, en:"I always have breakfast at home. I like to eat toast and eggs. It's quick and healthy.", vi:"Tôi luôn ăn sáng ở nhà. Tôi thích ăn bánh mì nướng và trứng. Nhanh và tốt cho sức khỏe.", opts:["I always eat out. Fast food is convenient for me.","I always have breakfast at home. I like to eat toast and eggs. It's quick and healthy.","I skip breakfast because I'm usually in a hurry."], ans:1 },
      { speaker:'Anna', avatar:'A', cls:'av-a', time:'0:38', sec:38, en:"What time do you leave for work?", vi:"Bạn đi làm lúc mấy giờ?", opts:["What time do you finish work?","What time do you leave for work?","How long does it take to get to work?"], ans:1 },
      { speaker:'Ben',  avatar:'B', cls:'av-b', time:'0:44', sec:44, en:"I leave at eight o'clock. I take the bus because parking is very expensive near my office.", vi:"Tôi đi lúc tám giờ. Tôi đi xe buýt vì đỗ xe rất đắt gần văn phòng.", opts:["I leave at nine. I drive my car to work every day.","I leave at eight o'clock. I take the bus because parking is very expensive near my office.","I take the subway at seven thirty in the morning."], ans:1 },
      { speaker:'Anna', avatar:'A', cls:'av-a', time:'1:02', sec:62, en:"That sounds like a good routine. Do you exercise in the morning?", vi:"Nghe có vẻ là lịch trình tốt. Buổi sáng bạn có tập thể dục không?", opts:["Do you watch TV in the evenings?","That sounds like a good routine. Do you exercise in the morning?","Do you have any hobbies after work?"], ans:1 },
      { speaker:'Ben',  avatar:'B', cls:'av-b', time:'1:10', sec:70, en:"Yes! I go for a short run before breakfast. About twenty minutes.", vi:"Có! Tôi chạy bộ ngắn trước bữa sáng. Khoảng hai mươi phút.", opts:["Yes! I go for a short run before breakfast. About twenty minutes.","No, I don't have time to exercise in the morning.","I go to the gym every evening after work."], ans:0 },
      { speaker:'Anna', avatar:'A', cls:'av-a', time:'1:22', sec:82, en:"That's impressive. I always sleep in and skip breakfast.", vi:"Thật ấn tượng. Tôi hay ngủ nướng và bỏ bữa sáng.", opts:["That's boring. I exercise every morning too.","That's impressive. I always sleep in and skip breakfast.","I agree! Morning routines are very important."], ans:1 },
      { speaker:'Ben',  avatar:'B', cls:'av-b', time:'1:30', sec:90, en:"You should try waking up earlier. It really changes your whole day!", vi:"Bạn nên thử dậy sớm hơn đi. Nó thực sự thay đổi cả ngày của bạn đấy!", opts:["Sleeping in is actually good for your health.","You should try waking up earlier. It really changes your whole day!","I think everyone has a different routine."], ans:1 },
    ];
  }

  private loadDemoVocab() {
    this.vocabs = [
      { word: 'wake up', mean: 'thức dậy' },
      { word: 'routine', mean: 'thói quen hàng ngày' },
      { word: 'breakfast', mean: 'bữa sáng' },
      { word: 'toast', mean: 'bánh mì nướng' },
      { word: 'parking', mean: 'đỗ xe / bãi đậu xe' },
      { word: 'impressive', mean: 'ấn tượng' },
      { word: 'exercise', mean: 'tập thể dục' },
      { word: 'skip', mean: 'bỏ qua' },
    ];
  }

  private loadDemoData() {
    this.loadDemoDialogue();
    this.loadDemoVocab();
    this.questions = [
      { id: 1, question: 'What time does Ben usually wake up?', options: ['Six o\'clock', 'Six thirty', 'Seven o\'clock'], correct_answer: 'Six thirty' },
      { id: 2, question: 'How does Ben get to work?', options: ['By car', 'On foot', 'By bus'], correct_answer: 'By bus' },
    ];
    this.correctAnswers = { 1: 'b', 2: 'c' };
    this.answered = {};
    this.duration = 242;
  }

  /* ──────── GETTERS ──────── */

  get pct(): number {
    return this.duration > 0 ? (this.currentSec / this.duration) * 100 : 0;
  }

  get ringOffset(): number {
    return 188.5 * (1 - this.currentSec / this.duration);
  }

  get currentLine(): number {
    let active = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.currentSec >= this.lines[i].sec) active = i;
    }
    return active;
  }

  get questionCount(): number {
    return this.questions.length;
  }

  get typeLabel(): string {
    const m: Record<string, string> = { conversation: 'Hội thoại', lecture: 'Bài giảng', podcast: 'Podcast', news: 'Tin tức' };
    return m[this.exercise?.type] || 'Hội thoại';
  }

  get diffLabel(): string {
    const level = this.exercise?.level || 'A1';
    if (level <= 'A2') return 'Dễ';
    if (level <= 'B1') return 'Trung bình';
    return 'Khó';
  }

  get dictTokens(): string[] {
    return this.tokenize(this.lines[this.dictIdx]?.en || '');
  }

  get dictState(): DictState {
    if (!this.dictAnswered[this.dictIdx]) {
      const tokens = this.dictTokens;
      const n = tokens.length;
      const count = Math.round(n * this.hideLevel / 100);
      const all = [...Array(n).keys()].sort(() => Math.random() - 0.5);
      const hidden = (count >= n) ? tokens.map((_, i) => i) : all.slice(0, count).sort((a, b) => a - b);
      this.dictAnswered[this.dictIdx] = { hidden, revealed: [] };
    }
    return this.dictAnswered[this.dictIdx];
  }

  get dictLine(): DialogueLine {
    return this.lines[this.dictIdx];
  }

  /* ──────── FORMAT ──────── */

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  private tokenize(str: string): string[] {
    return str.match(/[\w']+[.,!?]?/g) || [];
  }

  getBlankWidth(tok: string): number {
    return Math.max(28, tok.replace(/[.,!?]/g, '').length * 10);
  }

  /* ──────── PLAYBACK ──────── */

  togglePlay() {
    this.playing = !this.playing;
    if (this.playing) {
      this.lastTimestamp = null;
      this.zone.runOutsideAngular(() => {
        this.animFrameId = requestAnimationFrame(ts => this.tick(ts));
      });
    }
  }

  private tick(ts: number) {
    if (!this.playing) return;
    if (this.lastTimestamp) {
      this.currentSec += ((ts - this.lastTimestamp) / 1000) * this.speed;
      if (this.currentSec >= this.duration) {
        this.currentSec = this.duration;
        this.playing = false;
        this.zone.run(() => { this.playing = false; });
        return;
      }
    }
    this.lastTimestamp = ts;
    this.zone.run(() => { this.currentSec = this.currentSec; });
    this.animFrameId = requestAnimationFrame(t => this.tick(t));
  }

  private stopPlayback() {
    this.playing = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  jumpTo(sec: number) {
    this.currentSec = Math.max(0, Math.min(sec, this.duration));
  }

  seek(delta: number) {
    this.jumpTo(this.currentSec + delta);
  }

  onProgressClick(event: MouseEvent) {
    if (this.dragging) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.jumpTo(((event.clientX - rect.left) / rect.width) * this.duration);
  }

  onProgressDragStart(event: MouseEvent) {
    event.preventDefault();
    this.dragging = true;
    this.seekFromEvent(event);
    const onMove = (e: MouseEvent) => {
      if (!this.dragging) return;
      this.seekFromEvent(e);
    };
    const onUp = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onProgressTouchStart(event: TouchEvent) {
    this.dragging = true;
    this.seekFromTouch(event);
    const onMove = (e: TouchEvent) => {
      if (!this.dragging) return;
      this.seekFromTouch(e);
    };
    const onEnd = () => {
      this.dragging = false;
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }

  private seekFromEvent(event: MouseEvent) {
    const track = document.querySelector('.progress-track') as HTMLElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.jumpTo(pct * this.duration);
  }

  onTrackMouseLeave() {
    this.dragging = false;
  }

  private seekFromTouch(event: TouchEvent) {
    const track = document.querySelector('.progress-track') as HTMLElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const touch = event.touches[0];
    if (!touch) return;
    const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    this.jumpTo(pct * this.duration);
  }

  onWaveClick(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.jumpTo(((event.clientX - rect.left) / rect.width) * this.duration);
  }

  setSpeed(s: number) {
    this.speed = s;
  }

  setVolume(event: Event) {
    const v = +(event.target as HTMLInputElement).value;
    this.muted = v === 0;
  }

  toggleMute() {
    this.muted = !this.muted;
  }

  setView(mode: 'both' | 'en' | 'vi') {
    this.viewMode = mode;
  }

  /* ──────── MODE TABS ──────── */

  switchMode(mode: 'full' | 'check' | 'dictation') {
    this.activeMode = mode;
  }

  /* ──────── NGHE CHECK ──────── */

  shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  getCheckOptions(lineIdx: number): { text: string; orig: number }[] {
    const l = this.lines[lineIdx];
    if (!l) return [];
    const shuffled = l.opts.map((text, orig) => ({ text, orig })).sort(() => Math.random() - 0.5);
    return shuffled;
  }

  getCorrectCheckIdx(lineIdx: number): number {
    const shuffled = this.getCheckOptions(lineIdx);
    return shuffled.findIndex(s => s.orig === this.lines[lineIdx]?.ans);
  }

  answerCheck(lineIdx: number, chosenIdx: number) {
    if (this.checkState[lineIdx]?.answered) return;
    if (!this.checkState[lineIdx]) {
      this.checkState[lineIdx] = { answered: false, correct: false };
    }
    this.checkState[lineIdx].answered = true;
    const correctIdx = this.getCorrectCheckIdx(lineIdx);
    if (chosenIdx === correctIdx) {
      this.checkState[lineIdx].correct = true;
    }
  }

  isCheckCorrect(lineIdx: number): boolean {
    return this.checkState[lineIdx]?.correct || false;
  }

  isCheckWrong(lineIdx: number, optIdx: number): boolean {
    if (!this.checkState[lineIdx]?.answered) return false;
    if (this.isCheckCorrect(lineIdx)) return false;
    const correctIdx = this.getCorrectCheckIdx(lineIdx);
    return optIdx !== correctIdx;
  }

  /* ──────── NGHE CHÉP ──────── */

  dictPrev() {
    if (this.dictIdx > 0) {
      this.dictIdx--;
      this.dictResetInput();
    }
  }

  dictNext() {
    if (this.dictIdx < this.lines.length - 1) {
      this.dictIdx++;
      this.dictResetInput();
    }
  }

  private dictResetInput() {
    this.dictInput = '';
    this.dictResultText = '';
    this.dictResultType = '';
  }

  setHideLevel(level: number) {
    this.hideLevel = level;
    delete this.dictAnswered[this.dictIdx];
    this.dictResetInput();
  }

  toggleDictLoop() {
    this.dictLoop = !this.dictLoop;
  }

  dictPlayCurrent() {
    this.jumpTo(this.lines[this.dictIdx].sec);
    if (!this.playing) this.togglePlay();
    const next = this.lines[this.dictIdx + 1];
    if (next) {
      const dur = (next.sec - this.lines[this.dictIdx].sec) * 1000 / this.speed;
      setTimeout(() => {
        if (this.playing) this.togglePlay();
      }, dur);
    }
  }

  revealWord(idx: number) {
    const state = this.dictState;
    if (!state.revealed.includes(idx)) {
      state.revealed.push(idx);
    }
  }

  revealHint(count: number) {
    const state = this.dictState;
    const stillHidden = state.hidden.filter(i => !state.revealed.includes(i));
    if (count >= 999) {
      state.revealed = [...state.hidden];
    } else {
      const toReveal = stillHidden.slice(0, count);
      toReveal.forEach(i => {
        if (!state.revealed.includes(i)) state.revealed.push(i);
      });
    }
  }

  checkDictation() {
    const input = this.dictInput.trim();
    const l = this.lines[this.dictIdx];
    if (!l) return;
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?'"]/g, '').replace(/\s+/g, ' ').trim();
    if (normalize(input) === normalize(l.en)) {
      this.dictResultType = 'ok';
      this.dictResultText = '✓ Chính xác! Nhấn Enter để sang câu tiếp theo.';
      const state = this.dictState;
      state.revealed = this.dictTokens.map((_, i) => i);
    } else {
      this.dictResultType = 'err';
      this.dictResultText = `✗ Chưa đúng. Câu đúng: <em style="color:#22a06b">${l.en}</em>`;
    }
  }

  onDictKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.dictResultType === 'ok') {
        this.dictNext();
      } else {
        this.checkDictation();
      }
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      this.revealHint(1);
    }
    if (event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.dictPlayCurrent();
    }
  }

  resetDictation() {
    delete this.dictAnswered[this.dictIdx];
    this.dictResetInput();
  }

  dictTrackByFn(index: number, item: DialogueLine): number {
    return item.sec;
  }

  /* ──────── Q&A SIDEBAR ──────── */

  toggleQuestion(n: number) {
    if (this.answered[n]) return;
    const el = document.getElementById('q-popup-' + n);
    if (el) el.classList.toggle('show');
  }

  answerQ(n: number, choice: string, event: Event) {
    event.stopPropagation();
    if (this.answered[n]) return;
    const correct = this.correctAnswers[n];
    const popup = document.getElementById('q-popup-' + n);
    const options = popup?.querySelectorAll('.answer-option');
    const l = ['a', 'b', 'c'];
    if (options) {
      options.forEach((opt, i) => {
        (opt as HTMLElement).style.pointerEvents = 'none';
        if (l[i] === correct) opt.classList.add('correct');
        else if (l[i] === choice && choice !== correct) opt.classList.add('wrong');
      });
    }
    this.answered[n] = true;
    if (choice === correct) {
      this.answeredCount++;
    }
  }

  /* ──────── VOCAB ──────── */

  playVocab(idx: number) {
    if (this.vocabSeenCount < this.vocabs.length) {
      this.vocabSeenCount++;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/listening']);
  }
}
