import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlacementService } from '../../../core/services/placement.service';

interface PlacementQuestion {
  tag: string;
  q: string;
  opts: string[];
  a: number;
}

interface PlacementLevel {
  min: number;
  max: number;
  code: string;
  name: string;
  bg: string;
  fg: string;
  desc: string;
}

const QUESTIONS: PlacementQuestion[] = [
  { tag: 'Ngữ pháp cơ bản', q: 'She ___ a student.', opts: ['is', 'are', 'be', 'am'], a: 0 },
  { tag: 'Từ vựng', q: 'Chọn từ trái nghĩa với "hot":', opts: ['cold', 'fast', 'big', 'new'], a: 0 },
  { tag: 'Ngữ pháp cơ bản', q: 'There ___ two cats in the garden.', opts: ['is', 'are', 'be', 'was'], a: 1 },
  { tag: 'Từ vựng', q: '"Book" nghĩa là gì?', opts: ['quyển sách', 'cái bàn', 'con mèo', 'ngôi nhà'], a: 0 },
  { tag: 'Thì hiện tại', q: 'I usually ___ breakfast at 7 AM.', opts: ['have', 'having', 'has', 'had'], a: 0 },
  { tag: 'Giới từ', q: 'The keys are ___ the table.', opts: ['on', 'in', 'at', 'of'], a: 0 },
  { tag: 'Thì quá khứ', q: 'Yesterday, they ___ to the cinema.', opts: ['go', 'goes', 'went', 'gone'], a: 2 },
  { tag: 'So sánh', q: 'This book is ___ than that one.', opts: ['interesting', 'more interesting', 'most interesting', 'interestinger'], a: 1 },
  { tag: 'Thì tương lai', q: 'I think it ___ rain tomorrow.', opts: ['will', 'would', 'is', 'was'], a: 0 },
  { tag: 'Câu hỏi', q: '___ do you usually wake up?', opts: ['What', 'When', 'Who', 'Which'], a: 1 },
  { tag: 'Hiện tại hoàn thành', q: 'She ___ already finished her homework.', opts: ['has', 'have', 'is', 'did'], a: 0 },
  { tag: 'Câu điều kiện', q: 'If it rains, I ___ stay home.', opts: ['will', 'would', 'had', 'was'], a: 0 },
  { tag: 'Bị động', q: 'The email ___ sent yesterday.', opts: ['is', 'was', 'were', 'be'], a: 1 },
  { tag: 'Cụm từ', q: '"To give up" nghĩa là:', opts: ['từ bỏ', 'cho đi', 'tăng lên', 'đứng dậy'], a: 0 },
  { tag: 'Mệnh đề quan hệ', q: 'The man ___ called you is my uncle.', opts: ['who', 'whom', 'which', 'whose'], a: 0 },
  { tag: 'Câu điều kiện loại 2', q: 'If I ___ rich, I would travel the world.', opts: ['am', 'was', 'were', 'be'], a: 2 },
  { tag: 'Thành ngữ', q: '"Under the weather" nghĩa là:', opts: ['cảm thấy không khỏe', 'rất vui', 'đang trời mưa', 'bận rộn'], a: 0 },
  { tag: 'Câu tường thuật', q: 'He said that he ___ tired.', opts: ['is', 'was', 'be', 'were'], a: 1 },
  { tag: 'Ngữ pháp nâng cao', q: 'Hardly ___ she arrived when the phone rang.', opts: ['had', 'did', 'has', 'was'], a: 0 },
  { tag: 'Từ vựng học thuật', q: '"To mitigate" gần nghĩa nhất với:', opts: ['làm giảm bớt', 'làm tăng thêm', 'bỏ qua', 'xác nhận'], a: 0 },
];

const LEVELS: PlacementLevel[] = [
  { min: 0, max: 4, code: 'A1', name: 'Mới bắt đầu (Beginner)', bg: '#fef2f2', fg: '#ef4444', desc: 'Bạn đang làm quen với những cấu trúc câu và từ vựng cơ bản nhất. Lộ trình phù hợp sẽ tập trung vào giao tiếp hàng ngày đơn giản và nền tảng ngữ pháp.' },
  { min: 5, max: 8, code: 'A2', name: 'Sơ cấp (Elementary)', bg: '#fff7e6', fg: '#d97706', desc: 'Bạn nắm được các cấu trúc câu cơ bản nhưng cần củng cố thì và từ vựng để diễn đạt tự nhiên hơn trong các tình huống quen thuộc.' },
  { min: 9, max: 13, code: 'B1', name: 'Trung cấp (Intermediate)', bg: '#fefce8', fg: '#eab308', desc: 'Bạn có thể giao tiếp trong nhiều tình huống thường gặp. Lộ trình tiếp theo nên đi sâu vào ngữ pháp phức tạp và mở rộng vốn từ theo chủ đề.' },
  { min: 14, max: 17, code: 'B2', name: 'Trung cao cấp (Upper-Intermediate)', bg: '#ecfdf3', fg: '#16a34a', desc: 'Bạn sử dụng tiếng Anh khá thành thạo. Trọng tâm nên là luyện phản xạ, viết học thuật và các cấu trúc nâng cao ít gặp.' },
  { min: 18, max: 20, code: 'C1', name: 'Cao cấp (Advanced)', bg: '#ede9fe', fg: '#6d28d9', desc: 'Bạn có nền tảng vững chắc, gần với người bản xứ. Lộ trình phù hợp là luyện chuyên sâu theo mục tiêu: học thuật, công việc, hoặc luyện thi chứng chỉ quốc tế.' },
];

const ROADMAP: Record<string, string[]> = {
  A1: ['Khóa Nền tảng 1: Bảng chữ cái & phát âm', 'Khóa Nền tảng 2: 500 từ vựng thiết yếu', 'Câu lạc bộ giao tiếp cho người mới'],
  A2: ['Khóa Ngữ pháp căn bản toàn diện', 'Từ vựng theo chủ đề đời sống', 'Luyện nghe nói trình độ sơ cấp'],
  B1: ['Ngữ pháp trung cấp: các thì phức hợp', 'Luyện kỹ năng viết đoạn văn', 'Câu lạc bộ hội thoại chủ đề xã hội'],
  B2: ['Luyện thi IELTS/TOEIC nền tảng', 'Viết luận học thuật', 'Tiếng Anh giao tiếp công sở'],
  C1: ['Luyện đề IELTS 7.0+', 'Tiếng Anh chuyên ngành nâng cao', 'Câu lạc bộ tranh biện & thuyết trình'],
};

@Component({
  selector: 'app-placement-test',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './placement-test.component.html',
  styleUrls: ['./placement-test.component.css']
})
export class PlacementTestComponent implements OnInit {
  stage: 'intro' | 'quiz' | 'result' = 'intro';
  current = 0;
  answers: (number | null)[] = new Array(QUESTIONS.length).fill(null);
  returnUrl = '/profile';
  saving = false;
  errorMsg = '';

  questions = QUESTIONS;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private placementService: PlacementService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/profile';
    });
  }

  get currentQ(): PlacementQuestion {
    return this.questions[this.current];
  }

  get progressWidth(): string {
    if (this.stage === 'result') return '100%';
    if (this.stage === 'intro') return '0%';
    return `${(this.current / this.questions.length) * 100}%`;
  }

  get stepText(): string {
    if (this.stage === 'quiz') return `Câu ${this.current + 1} / ${this.questions.length}`;
    if (this.stage === 'result') return 'Hoàn thành';
    return '';
  }

  get nextLabel(): string {
    return this.current === this.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo';
  }

  get backLabel(): string {
    return this.current === 0 ? 'Về trang đầu' : 'Quay lại';
  }

  get score(): number {
    let s = 0;
    this.questions.forEach((item, i) => {
      if (this.answers[i] === item.a) s++;
    });
    return s;
  }

  get level(): PlacementLevel {
    return LEVELS.find(l => this.score >= l.min && this.score <= l.max) || LEVELS[0];
  }

  get roadmap(): string[] {
    return ROADMAP[this.level.code] || [];
  }

  start() {
    this.stage = 'quiz';
    this.current = 0;
    this.errorMsg = '';
  }

  select(idx: number) {
    this.answers[this.current] = idx;
  }

  back() {
    if (this.current > 0) {
      this.current--;
    } else {
      this.stage = 'intro';
    }
  }

  next() {
    if (this.answers[this.current] === null) return;
    if (this.current < this.questions.length - 1) {
      this.current++;
    } else {
      this.finish();
    }
  }

  retake() {
    this.current = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.errorMsg = '';
    this.stage = 'intro';
  }

  finish() {
    this.stage = 'result';
    this.saving = true;
    this.errorMsg = '';
    this.authService.savePlacementResult(this.level.code, this.score).subscribe({
      next: () => {
        this.saving = false;
        this.placementService.markDone();
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err.error?.message || 'Không lưu được kết quả, bấm "Thử lại" để lưu.';
      }
    });
  }

  retrySave() {
    this.finish();
    this.stage = 'result';
  }

  goToLesson() {
    this.router.navigateByUrl(this.returnUrl);
  }
}
