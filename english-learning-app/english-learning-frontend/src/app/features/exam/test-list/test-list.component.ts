import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService, Test as ApiTest, BackendQuestion, BackendSubQuestion } from '../../../core/services/exam.service';

interface LocalTest {
  _id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
}

interface LocalQuestion {
  id: number;
  backendId: string;
  type: 'listening_photo' | 'reading_grammar' | 'reading_passage' | 'multiple_choice';
  instruction: string;
  audio?: { duration: string };
  image?: string;
  passage?: string;
  question?: string;
  text?: string;
  options: string[];
  correct: number;
  group?: string;
  groupCount?: string;
  subQuestions?: LocalQuestion[];
}

interface PartSelection {
  [key: number]: boolean;
}

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent implements OnInit, OnDestroy {
  Math = Math;
  view: 'list' | 'exam' | 'result' = 'list';

  /* categories */
  categories = [
    { key: 'toeic', label: 'TOEIC', icon: 'fa-solid fa-pen-to-square' },
    { key: 'thpt', label: 'THPT Quốc gia', icon: 'fa-solid fa-graduation-cap' },
    { key: 'ielts', label: 'IELTS', icon: 'fa-solid fa-language' },
    { key: 'general', label: 'Tổng hợp', icon: 'fa-solid fa-book-open' },
  ];
  activeCategory = 'toeic';

  /* tests from API */
  apiTests: ApiTest[] = [];
  loading = false;

  /* local test display */
  tests: LocalTest[] = [];

  /* modal */
  modalOpen = false;
  modalTestId = '';
  modalTab: 'exam' | 'practice' = 'exam';
  selectedMode: 'full' | 'part' = 'full';
  partSelection: PartSelection = {};
  examMode: 'listening' | 'reading' = 'listening';

  /* exam state */
  currentExam: ApiTest | null = null;
  currentQIdx = 0;
  userAnswers: { [key: number]: number } = {};
  flagged: { [key: number]: boolean } = {};
  timeLeft = 0;
  private timerInterval: any = null;
  answeredCount = 0;

  /* exam type: standard (TOEIC) or structured (THPT) */
  examType: 'standard' | 'structured' = 'standard';

  /* structured exam (THPT) */
  examSections: any[] = [];
  currentSectionIdx = 0;
  currentSectionQIdx = 0;
  thptAnswers: { [num: number]: string } = {};
  thptAnsweredCount = 0;
  activeQId: number | null = null;
  showConfirm = false;
  showResultModal = false;
  resultCorrect = 0;
  resultWrong = 0;
  resultSkip = 0;
  resultScore = 0;
  isReviewMode = false;

  /* audio */
  playing = false;
  audioProgress = 0;
  private playTimer: any = null;

  /* result */
  correctCount = 0;
  scorePercent = 0;
  timeTaken = 0;
  showReview = false;
  submitError = '';

  /* question data (for standard TOEIC exams) */
  questions: LocalQuestion[] = [];

  /* dynamic right panel */
  renderKey = 0;

  /* divider drag */
  dividerDragging = false;
  leftRatio = 0.5;

  private qIdCounter = 1;

  constructor(
    private router: Router,
    private zone: NgZone,
    private examService: ExamService
  ) {}

  ngOnInit() {
    this.fetchTests();
  }

  ngOnDestroy() {
    this.clearTimer();
    this.stopAudio();
  }

  fetchTests() {
    this.loading = true;
    this.examService.getByCategory(this.activeCategory).subscribe({
      next: (res) => {
        this.apiTests = res.data || [];
        this.tests = this.apiTests.map(t => ({
          _id: t._id,
          title: t.title,
          description: t.description,
          total_questions: t.total_questions || 200,
          duration_minutes: t.duration_minutes
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch tests:', err);
        this.loading = false;
      }
    });
  }

  /* ─── CATEGORY ─── */
  setCategory(cat: string) {
    this.activeCategory = cat;
    this.fetchTests();
  }

  /* ─── MODAL ─── */
  openModal(id: string) {
    this.modalTestId = id;
    this.modalOpen = true;
    this.selectedMode = 'full';
    this.partSelection = {};
  }

  closeModal() {
    this.modalOpen = false;
  }

  setModalTab(tab: 'exam' | 'practice') {
    this.modalTab = tab;
  }

  selectMode(mode: 'full' | 'part') {
    this.selectedMode = mode;
  }

  togglePartAll() {
    const allSelected = Object.keys(this.partSelection).length === 7;
    for (let i = 1; i <= 7; i++) {
      this.partSelection[i] = !allSelected;
    }
  }

  togglePart(n: number) {
    this.partSelection[n] = !this.partSelection[n];
  }

  isPartSelected(n: number): boolean {
    return !!this.partSelection[n];
  }

  get allPartsSelected(): boolean {
    return Object.keys(this.partSelection).length === 7;
  }

  /* ─── THPT DIRECT START ─── */
  startTHPTExam(testId: string) {
    this.examMode = 'reading';
    this.qIdCounter = 1;
    this.userAnswers = {};
    this.flagged = {};
    this.answeredCount = 0;
    this.questions = [];
    this.examSections = [];
    this.submitError = '';
    this.thptAnswers = {};
    this.thptAnsweredCount = 0;
    this.activeQId = null;
    this.showConfirm = false;
    this.showResultModal = false;
    this.isReviewMode = false;
    this.submitted = false;

    const found = this.apiTests.find(t => t._id === testId);
    if (!found) return;

    this.currentExam = found;
    this.loading = true;

    this.examService.getQuestions(testId).subscribe({
      next: (res) => {
        this.examType = 'structured';
        this.examSections = res.data.content?.sections || [];
        this.currentSectionIdx = 0;
        this.currentSectionQIdx = 0;
        this.timeLeft = (this.currentExam?.duration_minutes || 50) * 60;
        this.view = 'exam';
        this.startTimer();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load questions:', err);
        this.loading = false;
      }
    });
  }

  /* ─── EXAM ─── */
  startExam(event: Event, mode: 'listening' | 'reading') {
    event.stopPropagation();
    this.examMode = mode;
    this.qIdCounter = 1;
    this.userAnswers = {};
    this.flagged = {};
    this.answeredCount = 0;
    this.questions = [];
    this.examSections = [];
    this.submitError = '';
    this.thptAnswers = {};
    this.thptAnsweredCount = 0;
    this.activeQId = null;
    this.showConfirm = false;
    this.showResultModal = false;
    this.isReviewMode = false;
    this.submitted = false;
    this.closeModal();

    const found = this.apiTests.find(t => t._id === this.modalTestId);
    if (!found) return;

    this.currentExam = found;
    this.loading = true;

    this.examService.getQuestions(this.modalTestId).subscribe({
      next: (res) => {
        if (res.data.examType === 'structured') {
          // THPT structured exam
          this.examType = 'structured';
          this.examSections = res.data.content?.sections || [];
          this.currentSectionIdx = 0;
          this.currentSectionQIdx = 0;
        } else {
          // Standard TOEIC exam
          this.examType = 'standard';
          this.questions = this.transformQuestions(res.data.questions);
          this.currentQIdx = mode === 'listening' ? 0 : this.findFirstReadingIndex();
        }
        this.timeLeft = (this.currentExam?.duration_minutes || 120) * 60;
        this.view = 'exam';
        this.startTimer();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load questions:', err);
        this.loading = false;
      }
    });
  }

  private findFirstReadingIndex(): number {
    const readingTypes = ['reading_grammar', 'reading_passage', 'multiple_choice'];
    const idx = this.questions.findIndex(q => readingTypes.includes(q.type));
    return idx >= 0 ? idx : 0;
  }

  private transformQuestions(backendQuestions: BackendQuestion[]): LocalQuestion[] {
    const result: LocalQuestion[] = [];

    for (const bq of backendQuestions) {
      const type = this.mapQuestionType(bq.question_type, bq.part);

      if (bq.sub_questions && bq.sub_questions.length > 0) {
        const subs: LocalQuestion[] = bq.sub_questions.map((sq: BackendSubQuestion, si: number) => ({
          id: this.qIdCounter++,
          backendId: sq.id,
          type: 'reading_passage',
          instruction: sq.instruction || '',
          text: sq.question_text,
          options: sq.options_json,
          correct: 0,
        }));

        result.push({
          id: this.qIdCounter++,
          backendId: bq.id,
          type: 'reading_passage',
          instruction: bq.instruction || '',
          passage: bq.passage || '',
          group: bq.group_label || `Questions ${bq.sub_questions.length}`,
          groupCount: `${bq.sub_questions.length} câu hỏi`,
          options: [],
          correct: 0,
          subQuestions: subs,
        });
      } else {
        result.push({
          id: this.qIdCounter++,
          backendId: bq.id,
          type: type,
          instruction: bq.instruction || '',
          question: bq.question_text,
          text: bq.question_text,
          options: bq.options_json,
          correct: 0,
          image: bq.image_url || undefined,
          audio: bq.audio_url ? { duration: '0:30' } : undefined,
          passage: bq.passage || undefined,
        });
      }
    }
    return result;
  }

  private mapQuestionType(questionType: string, part: number | null): LocalQuestion['type'] {
    if (part === 1 || part === 2) return 'listening_photo';
    if (questionType === 'listening_photo' || questionType === 'listening_question') return 'listening_photo';
    if (questionType === 'reading_grammar') return 'reading_grammar';
    if (questionType === 'reading_passage') return 'reading_passage';
    return 'multiple_choice';
  }

  exitExam() {
    this.clearTimer();
    this.stopAudio();
    this.view = 'list';
  }

  /* ─── AUDIO ─── */
  togglePlay() {
    this.playing = !this.playing;
    if (this.playing) {
      this.audioProgress = 8;
      this.playTimer = setInterval(() => {
        this.audioProgress = Math.min(100, this.audioProgress + 0.5);
        if (this.audioProgress >= 100) {
          this.stopAudio();
        }
      }, 150);
    } else {
      this.stopAudio();
    }
  }

  private stopAudio() {
    this.playing = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }

  get waveHeights(): number[] {
    return [18, 26, 14, 32, 22, 28, 16, 36, 24, 20, 30, 18, 34, 22, 16, 28, 32, 14, 26, 20,
            36, 18, 24, 30, 16, 22, 28, 34, 20, 26, 18, 32, 14, 28, 24, 16, 30, 22, 36, 18,
            26, 14, 32, 20, 28, 16, 24, 30, 22, 18, 34, 16, 26, 28, 14, 32, 20, 24, 36, 18];
  }

  get currentQuestion(): LocalQuestion {
    return this.questions[this.currentQIdx];
  }

  get totalQuestions(): number {
    if (this.examType === 'structured') {
      let count = 0;
      for (const s of this.examSections) {
        count += s.questions?.length || 0;
      }
      return count || this.currentExam?.total_questions || 40;
    }
    return this.currentExam?.total_questions || this.questions.length || 200;
  }

  /* ─── STRUCTURED EXAM (THPT) HELPERS ─── */
  get currentSection(): any {
    return this.examSections[this.currentSectionIdx];
  }

  get currentSectionQuestion(): any {
    const section = this.currentSection;
    if (!section || !section.questions) return null;
    return section.questions[this.currentSectionQIdx];
  }

  get sectionProgress(): string {
    if (!this.examSections.length) return '';
    let total = 0;
    for (const s of this.examSections) {
      total += s.questions?.length || 0;
    }
    let done = 0;
    for (let i = 0; i < this.currentSectionIdx; i++) {
      done += this.examSections[i].questions?.length || 0;
    }
    done += this.currentSectionQIdx + 1;
    return `Câu ${done}/${total}`;
  }

  nextSectionQ() {
    const section = this.currentSection;
    if (!section || !section.questions) return;
    if (this.currentSectionQIdx < section.questions.length - 1) {
      this.currentSectionQIdx++;
    } else if (this.currentSectionIdx < this.examSections.length - 1) {
      this.currentSectionIdx++;
      this.currentSectionQIdx = 0;
    }
  }

  prevSectionQ() {
    if (this.currentSectionQIdx > 0) {
      this.currentSectionQIdx--;
    } else if (this.currentSectionIdx > 0) {
      this.currentSectionIdx--;
      const prev = this.examSections[this.currentSectionIdx];
      this.currentSectionQIdx = (prev.questions?.length || 1) - 1;
    }
  }

  selectSectionAnswer(answerLabel: string) {
    const q = this.currentSectionQuestion;
    if (!q) return;
    const optIdx = q.options.findIndex((o: any) => o.label === answerLabel);
    if (optIdx >= 0) {
      this.userAnswers[q.id] = optIdx;
      this.answeredCount = Object.keys(this.userAnswers).length;
    }
  }

  isSectionAnswerSelected(qId: number, optIdx: number): boolean {
    return this.userAnswers[qId] === optIdx;
  }

  /* ─── ANSWERS ─── */
  selectAnswer(qId: number, idx: number) {
    this.userAnswers[qId] = idx;
    this.answeredCount = Object.keys(this.userAnswers).length;
  }

  isAnswerSelected(qId: number, idx: number): boolean {
    return this.userAnswers[qId] === idx;
  }

  toggleFlag(qId: number) {
    this.flagged[qId] = !this.flagged[qId];
  }

  isFlagged(qId: number): boolean {
    return !!this.flagged[qId];
  }

  /* ─── NAVIGATION ─── */
  nextQ() {
    if (this.currentQIdx < this.questions.length - 1) {
      this.currentQIdx++;
      this.renderKey++;
    }
  }

  prevQ() {
    if (this.currentQIdx > 0) {
      this.currentQIdx--;
      this.renderKey++;
    }
  }

  goToQ(idx: number) {
    this.currentQIdx = idx;
    this.renderKey++;
  }

  /* ─── DIVIDER DRAG ─── */
  onDividerMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.dividerDragging = true;
    const onMove = (e: MouseEvent) => {
      if (!this.dividerDragging) return;
      const container = document.querySelector('.exam-body') as HTMLElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      this.leftRatio = Math.max(0.25, Math.min(0.75, (e.clientX - rect.left) / rect.width));
    };
    const onUp = () => {
      this.dividerDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /* ─── TIMER ─── */
  private startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.clearTimer();
        if (this.examType === 'structured') this.doSubmit();
        else this.submitExam();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /* ─── SUBMIT ─── */
  submitExam() {
    this.clearTimer();
    this.stopAudio();

    if (!this.currentExam) {
      this.calculateLocalResult();
      return;
    }

    // Build answers array for backend
    const answerEntries: { questionId: string; userAnswer: string }[] = [];

    if (this.examType === 'structured') {
      // THPT structured exam: build answers from sections
      for (const section of this.examSections) {
        if (!section.questions) continue;
        for (const q of section.questions) {
          const selectedIdx = this.userAnswers[q.id];
          if (selectedIdx === undefined) continue;
          const selectedOpt = q.options[selectedIdx];
          if (selectedOpt) {
            answerEntries.push({ questionId: String(q.id), userAnswer: selectedOpt.label });
          }
        }
      }
    } else {
      // Standard TOEIC exam
      for (const q of this.questions) {
        const selectedIdx = this.userAnswers[q.id];
        if (selectedIdx === undefined) continue;

        if (q.subQuestions) {
          for (const sq of q.subQuestions) {
            const sqIdx = this.userAnswers[sq.id];
            if (sqIdx !== undefined && sq.options[sqIdx]) {
              const letter = String.fromCharCode(65 + sqIdx);
              answerEntries.push({ questionId: sq.backendId, userAnswer: letter });
            }
          }
        } else {
          if (q.options[selectedIdx]) {
            const letter = String.fromCharCode(65 + selectedIdx);
            answerEntries.push({ questionId: q.backendId, userAnswer: letter });
          }
        }
      }
    }

    this.loading = true;
    this.examService.submit(this.currentExam._id, answerEntries, this.timeTaken).subscribe({
      next: (res) => {
        this.correctCount = res.data.correct_answers;
        const totalQ = res.data.total_questions;
        this.scorePercent = Math.round(res.data.score);
        this.view = 'result';
        this.loading = false;
      },
      error: (err) => {
        console.error('Submit failed:', err);
        this.submitError = 'Không thể nộp bài. Vui lòng thử lại.';
        this.loading = false;
        this.calculateLocalResult();
      }
    });
  }

  private calculateLocalResult() {
    this.correctCount = this.questions.reduce((acc, q) => {
      if (q.subQuestions) {
        return acc + q.subQuestions.filter(sq => this.userAnswers[sq.id] === sq.correct).length;
      }
      return acc + (this.userAnswers[q.id] === q.correct ? 1 : 0);
    }, 0);
    const totalQ = this.questions.reduce((acc, q) => acc + (q.subQuestions?.length || 1), 0);
    this.scorePercent = Math.round((this.correctCount / totalQ) * 100);
    this.view = 'result';
  }

  retryExam() {
    if (this.currentExam) {
      this.userAnswers = {};
      this.flagged = {};
      this.answeredCount = 0;
      this.currentQIdx = 0;
      this.timeLeft = (this.currentExam?.duration_minutes || 120) * 60;
      this.view = 'exam';
      this.startTimer();
    }
  }

  /* ─── HELPERS ─── */
  isSubAnswerCorrect(q: LocalQuestion, subQ: LocalQuestion): boolean {
    return this.userAnswers[subQ.id] === subQ.correct;
  }

  isSubAnswerWrong(q: LocalQuestion, subQ: LocalQuestion, optIdx: number): boolean {
    return this.userAnswers[subQ.id] !== undefined && this.userAnswers[subQ.id] !== subQ.correct && this.userAnswers[subQ.id] === optIdx;
  }

  isSubAnswerSelected(q: LocalQuestion, subQ: LocalQuestion, optIdx: number): boolean {
    return this.userAnswers[subQ.id] === optIdx;
  }

  trackById(idx: number, item: LocalQuestion): number {
    return item.id;
  }

  /* ─── THPT ANSWER METHODS ─── */
  selectTHPTAnswer(num: number, label: string) {
    if (this.submitted || this.isReviewMode) return;
    const updated = { ...this.thptAnswers };
    if (updated[num] === label) {
      delete updated[num];
    } else {
      updated[num] = label;
    }
    this.thptAnswers = updated;
    this.thptAnsweredCount = Object.keys(this.thptAnswers).length;
    this.updateTHPTNav();
  }

  private updateTHPTNav() {
    const pct = this.totalTHPTQuestions > 0
      ? (this.thptAnsweredCount / this.totalTHPTQuestions) * 100 : 0;
    setTimeout(() => {
      const fill = document.getElementById('thpt-progress-fill');
      const txt = document.getElementById('thpt-progress-text');
      if (fill) fill.style.width = pct + '%';
      if (txt) txt.textContent = `${this.thptAnsweredCount} / ${this.totalTHPTQuestions} câu đã trả lời`;
      document.querySelectorAll('.thpt-q-btn').forEach(btn => {
        const num = parseInt((btn as HTMLElement).dataset['num'] || '', 10);
        btn.classList.toggle('answered', this.thptAnswers[num] !== undefined);
      });
    });
  }

  get totalTHPTQuestions(): number {
    let count = 0;
    for (const s of this.examSections) {
      count += s.questions?.length || 0;
    }
    return count || this.currentExam?.total_questions || 40;
  }

  get thptUnansweredCount(): number {
    return this.totalTHPTQuestions - this.thptAnsweredCount;
  }

  scrollToTHPT(num: number) {
    this.activeQId = num;
    const el = document.getElementById('thpt-q-' + num);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ─── THPT SUBMIT ─── */
  askSubmit() {
    if (this.submitted) return;
    this.showConfirm = true;
  }

  closeConfirm() {
    this.showConfirm = false;
  }

  doSubmit() {
    this.showConfirm = false;
    this.submitted = true;
    this.clearTimer();

    let correct = 0, wrong = 0, skip = 0;
    for (const sec of this.examSections) {
      if (!sec.questions) continue;
      for (const q of sec.questions) {
        const userAns = this.thptAnswers[q.id];
        if (userAns === undefined) { skip++; continue; }
        if (userAns === q.answerLabel) correct++;
        else wrong++;
      }
    }

    this.resultCorrect = correct;
    this.resultWrong = wrong;
    this.resultSkip = skip;
    const total = this.totalTHPTQuestions;
    this.resultScore = total > 0 ? Math.round((correct / total) * 100) : 0;
    this.showResultModal = true;
  }

  closeResult() {
    this.showResultModal = false;
  }

  reviewMode() {
    this.showResultModal = false;
    this.isReviewMode = true;
    // Highlight correct/wrong
    setTimeout(() => {
      document.querySelectorAll('.thpt-option-label').forEach(label => {
        const num = parseInt((label as HTMLElement).dataset['num'] || '', 10);
        const val = (label as HTMLElement).dataset['val'] || '';
        const qSection = this.findQuestion(num);
        if (!qSection) return;
        const q = qSection.questions.find((qq: any) => qq.id === num);
        if (!q) return;
        const isCorrect = val === q.answerLabel;
        const userSelected = this.thptAnswers[num];
        if (isCorrect) label.classList.add('correct');
        else if (val === userSelected && userSelected !== q.answerLabel) label.classList.add('wrong');
      });
    });
  }

  retryTHPTExam() {
    this.submitted = false;
    this.thptAnswers = {};
    this.thptAnsweredCount = 0;
    this.activeQId = null;
    this.showConfirm = false;
    this.showResultModal = false;
    this.isReviewMode = false;
    this.timeLeft = (this.currentExam?.duration_minutes || 50) * 60;
    this.startTimer();
    this.updateTHPTNav();
  }

  private findQuestion(num: number): any {
    for (const sec of this.examSections) {
      if (sec.questions) {
        const found = sec.questions.find((q: any) => q.id === num);
        if (found) return { section: sec, questions: sec.questions };
      }
    }
    return null;
  }

  isSentenceArrangement(type: string): boolean {
    return type === 'sentence_arrangement';
  }

  get thptSectionLabels(): { nums: number[]; label: string }[] {
    return this.examSections.map((sec, si) => ({
      label: ['Điền từ', 'Sắp xếp', 'Đọc hiểu 1', 'Đọc hiểu 2', 'Điền từ', 'Đọc hiểu 3'][si] || `Phần ${si+1}`,
      nums: sec.questions?.map((q: any) => q.id) || []
    }));
  }

  /* ─── THPT HELPERS ─── */
  sectionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'fill_in_blank': 'Đọc điền vào chỗ trống',
      'sentence_arrangement': 'Sắp xếp câu/đoạn văn',
      'reading_comprehension': 'Đọc hiểu'
    };
    return labels[type] || type;
  }

  renderPassageWithBlanks(section: any): string {
    if (!section || !section.passage) return '';
    let html = section.passage;
    if (section.questions) {
      for (const q of section.questions) {
        const blankStr = `(${q.blank})_____`;
        const selectedLabel = this.thptAnswers[q.id] || '___';
        const statusClass = this.thptAnswers[q.id] ? 'thpt-blank answered' : 'thpt-blank unanswered';
        html = html.replace(blankStr,
          `<span class="${statusClass}">${selectedLabel}</span>`);
      }
    }
    return html;
  }

  /* track submitted state for THPT */
  submitted = false;
}
