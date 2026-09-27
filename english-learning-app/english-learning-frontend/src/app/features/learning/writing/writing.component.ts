import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

interface Sentence { vn: string; en: string; hint: string }
interface Exercise {
  id: number; title: string; status: string; attempts: number;
  topic: string; lastAttempt: string; preview: string; sentences: Sentence[]
}
interface DictWord {
  word: string; type: 'word' | 'phrase'; meaning: string;
  example: string; highlightWord: string
}

@Component({
  selector: 'app-writing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.css']
})
export class WritingComponent implements OnInit, OnDestroy {
  /* data */
  exercises: Exercise[] = [
    { id:1, title:'A Heartfelt Thank You for Your Thoughtful Gift!', status:'not-started', attempts:0, topic:'Personal & Communication', lastAttempt:'1 minute ago',
      preview:'Emily thân mến, Tôi hy vọng tin nhắn này sẽ đến được với bạn. Tôi muốn cảm ơn bạn vì món quà đáng yêu này. Thật là m...',
      sentences:[
        { vn:'Emily thân mến,', en:'Dear Emily,', hint:"Lời chào đầu thư – tên + 'Dear'" },
        { vn:'Tôi hy vọng tin nhắn này sẽ đến được với bạn.', en:'I hope this message finds you well.', hint:"'finds you well' là cụm hay dùng trong thư tiếng Anh" },
        { vn:'Tôi muốn cảm ơn bạn vì món quà đáng yêu này.', en:'I wanted to thank you for the lovely gift.', hint:"Use 'wanted to' for a polite, warm tone" },
        { vn:'Thật là một bất ngờ tuyệt vời!', en:'It was such a wonderful surprise!', hint:"'such a' dùng để nhấn mạnh" },
        { vn:'Sự chu đáo của bạn có ý nghĩa rất lớn đối với tôi.', en:'Your thoughtfulness means so much to me.', hint:'thoughtfulness = sự chu đáo' },
        { vn:'Làm sao bạn biết tôi muốn món quà này?', en:'How did you know I wanted this?', hint:"Câu hỏi đơn giản – past tense 'did'" },
        { vn:'Tôi thực sự thích nó!', en:'I truly love it!', hint:'truly = thực sự, love it = thích lắm' },
        { vn:'Nó hoàn hảo cho văn phòng mới của tôi.', en:'It is perfect for my new office.', hint:'Ý chỉ món quà – "It is perfect for…"' },
        { vn:'Tôi đánh giá cao sự hào phóng và hỗ trợ của bạn.', en:'I appreciate your generosity and support.', hint:'appreciate = đánh giá cao, generosity = sự hào phóng' },
        { vn:'Bạn có muốn đến thăm không gian mới của tôi sớm không?', en:'Would you like to visit my new space soon?', hint:"'Would you like to' = lời mời lịch sự" },
        { vn:'Tôi rất muốn gặp lại và đưa bạn đi tham quan.', en:'I would love to see you and show you around.', hint:'show you around = đưa tham quan' },
        { vn:'Một lần nữa, cảm ơn bạn vì món quà tuyệt vời của bạn.', en:'Once again, thank you for your wonderful gift.', hint:'Once again = một lần nữa' },
        { vn:'Nó thực sự làm cho ngày của tôi tươi sáng hơn!', en:'It truly brightened my day!', hint:'brighten = làm sáng lên, brightened = quá khứ' },
        { vn:'Chúc may mắn,', en:'Warm regards,', hint:'Lời kết thư thân mật' },
        { vn:'Michael', en:'Michael', hint:'Chữ ký' }
      ]
    },
    { id:2, title:'Time for a Fun Weekend Adventure!', status:'new', attempts:0, topic:'Everyday Life', lastAttempt:'Never',
      preview:'Chào Emma, Tôi hy vọng bạn khỏe! Tôi đang nghĩ rằng chúng ta nên lên kế hoạch cho một chuyến đi chơi cuối tuần sớm t...',
      sentences:[
        { vn:'Chào Emma,', en:'Hi Emma,', hint:'Lời chào thân mật' },
        { vn:'Tôi hy vọng bạn khỏe!', en:'I hope you are doing well!', hint:'doing well = khỏe mạnh, tốt' },
        { vn:'Tôi đang nghĩ rằng chúng ta nên lên kế hoạch cho một chuyến đi chơi cuối tuần.', en:'I was thinking we should plan a fun weekend trip.', hint:"'was thinking' = đang nghĩ (quá khứ tiến hành)" },
        { vn:'Bạn có rảnh cuối tuần này không?', en:'Are you free this weekend?', hint:'free = rảnh rỗi' },
        { vn:'Chúng ta có thể đi dã ngoại hoặc tham quan thành phố.', en:'We could go for a picnic or explore the city.', hint:'explore = khám phá, picnic = dã ngoại' },
      ]
    },
    { id:3, title:'Checking In: How Are You Today?', status:'new', attempts:0, topic:'Personal & Communication', lastAttempt:'Never',
      preview:'Xin chào Sarah, Tôi hy vọng hôm nay bạn khỏe! Tôi muốn hỏi thăm bạn. Dự án của bạn thế nào rồi?...',
      sentences:[
        { vn:'Xin chào Sarah,', en:'Hello Sarah,', hint:'Lời chào đầu thư' },
        { vn:'Tôi hy vọng hôm nay bạn khỏe!', en:'I hope you are having a great day!', hint:'having a great day = có một ngày tốt lành' },
        { vn:'Tôi muốn hỏi thăm bạn.', en:'I just wanted to check in on you.', hint:'check in = hỏi thăm' },
        { vn:'Dự án của bạn thế nào rồi?', en:'How is your project coming along?', hint:'coming along = đang tiến triển như thế nào' },
      ]
    },
    { id:4, title:'Holiday Plans: What\'s on Your Agenda?', status:'new', attempts:0, topic:'Personal & Communication', lastAttempt:'Never',
      preview:'Xin chào Sarah, Tôi hy vọng bạn khỏe! Kỳ nghỉ sắp đến rồi. Bạn có kế hoạch gì cho thời gian này không?...',
      sentences:[
        { vn:'Xin chào Sarah,', en:'Dear Sarah,', hint:'Lời chào đầu thư' },
        { vn:'Kỳ nghỉ sắp đến rồi!', en:'The holidays are just around the corner!', hint:'around the corner = sắp đến' },
        { vn:'Bạn có kế hoạch gì cho thời gian này không?', en:'Do you have any plans for this time?', hint:'Do you have any plans = bạn có kế hoạch gì không' },
      ]
    },
    { id:5, title:'Catching Up and Checking In', status:'new', attempts:0, topic:'Personal & Communication', lastAttempt:'Never',
      preview:'Xin chào Sarah, Tôi hy vọng bạn vẫn ổn. Tôi muốn kiểm tra dự án tiếp thị. Mọi việc diễn ra thế nào ở phía bạn?...',
      sentences:[
        { vn:'Xin chào Sarah,', en:'Hi Sarah,', hint:'Lời chào đầu thư' },
        { vn:'Tôi hy vọng bạn vẫn ổn.', en:'I hope you are doing well.', hint:'doing well = vẫn ổn, khỏe' },
        { vn:'Mọi việc diễn ra thế nào ở phía bạn?', en:'How are things going on your end?', hint:'on your end = ở phía bạn' },
      ]
    },
    { id:6, title:'Just Checking In!', status:'new', attempts:0, topic:'Personal & Communication', lastAttempt:'Never',
      preview:'Xin chào! Tôi hy vọng bạn khỏe. Tôi muốn biết bạn thế nào. Cuối tuần của bạn thế nào?...',
      sentences:[
        { vn:'Xin chào!', en:'Hello there!', hint:'Lời chào thân mật' },
        { vn:'Tôi muốn biết bạn thế nào.', en:'I just wanted to see how you are doing.', hint:'how you are doing = bạn đang như thế nào' },
        { vn:'Cuối tuần của bạn thế nào?', en:'How was your weekend?', hint:"past tense 'was' vì cuối tuần đã qua" },
      ]
    }
  ];

  /* state */
  screen: 'home' | 'list' | 'exercise' = 'home';
  selectedLevel = 'beginner';
  selectedType = 'emails';
  currentExercise: Exercise | null = null;
  currentSentenceIdx = 0;
  totalAnswered = 0;
  totalScore = 0;
  credits = 10;
  points = 0;
  activeTab: 'dict' | 'acc' = 'dict';
  firstSubmit = false;
  hintVisible = false;
  answerText = '';
  feedback: any = null;
  loadingFeedback = false;
  averageAccuracy = 0;
  toastMsg = '';
  toastType = 'success';
  toastVisible = false;

  /* dictionary */
  dictWords: DictWord[] = [
    { word:'gift', type:'word', meaning:'Quà tặng, món quà.', example:'"She received a wonderful gift on her birthday."', highlightWord:'gift' },
    { word:'surprise', type:'word', meaning:'Sự bất ngờ.', example:'"The party was a complete surprise to her."', highlightWord:'surprise' },
    { word:'thoughtfulness', type:'word', meaning:'Tính chu đáo, ân cần.', example:'"Her thoughtfulness was evident in the way she planned the surprise party."', highlightWord:'thoughtfulness' },
    { word:'office', type:'word', meaning:'Văn phòng.', example:'"She arrived at the office early to prepare for the meeting."', highlightWord:'office' },
    { word:'generosity', type:'word', meaning:'Sự hào phóng.', example:'"Her generosity knew no bounds."', highlightWord:'generosity' },
    { word:'support', type:'word', meaning:'Hỗ trợ, giúp đỡ.', example:'"She will support me in my decisions."', highlightWord:'support' },
    { word:'space', type:'word', meaning:'Không gian hoặc vùng trống.', example:'"We need more space in this room."', highlightWord:'space' },
    { word:'day', type:'word', meaning:'Một khoảng thời gian 24 giờ.', example:'"I work eight hours a day."', highlightWord:'day' },
    { word:'lovely gift', type:'phrase', meaning:'Một món quà tuyệt đẹp.', example:'"It was a truly lovely gift from her family."', highlightWord:'lovely gift' },
    { word:'nice surprise', type:'phrase', meaning:'Một bất ngờ thú vị.', example:'"What a nice surprise to see you here!"', highlightWord:'nice surprise' },
  ];
  showDictModal = false;

  openDictModal() { this.showDictModal = true; }
  closeDictModal() { this.showDictModal = false; }

  constructor(private learningTracker: LearningTrackerService) {}

  ngOnInit() {
    this.learningTracker.startTracking('writing');
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }

  /* navigation */
  goTo(screen: 'home' | 'list' | 'exercise') {
    this.screen = screen;
  }

  selectLevel(level: string) { this.selectedLevel = level; }

  selectType(type: string) { this.selectedType = type; this.goTo('list'); }

  cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

  get filteredExercises(): Exercise[] {
    return this.exercises;
  }

  badgeClass(s: string): string {
    return s === 'new' ? 'badge-new' : s === 'not-started' ? 'badge-not-started' : 'badge-completed';
  }

  badgeText(s: string): string {
    return s === 'new' ? 'New' : s === 'not-started' ? 'Not Started' : 'Completed';
  }

  startExercise(ex: Exercise) {
    this.currentExercise = ex;
    this.currentSentenceIdx = 0;
    this.totalAnswered = 0;
    this.totalScore = 0;
    this.firstSubmit = false;
    this.credits = 10;
    this.points = 0;
    this.feedback = null;
    this.averageAccuracy = 0;
    this.answerText = '';
    this.hintVisible = false;
    this.goTo('exercise');
  }

  get totalSentences(): number { return this.currentExercise?.sentences.length || 0; }

  get progressPct(): number {
    return this.totalSentences > 0 ? (this.currentSentenceIdx / this.totalSentences) * 100 : 0;
  }

  get currentSentence(): Sentence | null {
    return this.currentExercise?.sentences[this.currentSentenceIdx] || null;
  }

  lookupWord(vn: string, en: string) {
    this.openDictModal();
  }

  switchTab(tab: 'dict' | 'acc') {
    this.activeTab = tab;
  }

  async submitAnswer() {
    if (!this.answerText.trim()) { this.showToast('Vui lòng nhập bản dịch!', 'error'); return; }
    this.loadingFeedback = true;

    if (!this.firstSubmit) { this.firstSubmit = true; }

    const sentence = this.currentSentence!;
    const prompt = `You are an English language tutor. A Vietnamese learner translated this sentence.

Vietnamese original: "${sentence.vn}"
Correct English: "${sentence.en}"
Learner's answer: "${this.answerText}"

Evaluate the translation and respond ONLY with a JSON object (no markdown) with these fields:
{
  "score": <number 0-100>,
  "isCorrect": <true/false>,
  "strengths": [<1-2 short strings>],
  "improvements": [<0-2 short strings, empty if perfect>],
  "correctedVersion": "<correct English if needed, empty if score>=90>"
}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content.map((c: any) => c.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      this.feedback = JSON.parse(clean);
    } catch {
      const ratio = this.answerText.toLowerCase().trim() === sentence.en.toLowerCase().trim() ? 95 : 60;
      this.feedback = {
        score: ratio,
        isCorrect: ratio > 80,
        strengths: ['Ý nghĩa cơ bản đúng', 'Cấu trúc câu hợp lý'],
        improvements: ratio < 80 ? ['Kiểm tra lại cách dùng thì', 'Chú ý từ vựng chính xác hơn'] : [],
        correctedVersion: ratio < 80 ? sentence.en : ''
      };
    }

    this.loadingFeedback = false;
    this.credits = Math.max(0, this.credits - 1);
    const gained = Math.floor(this.feedback.score / 10);
    this.points += gained;
    this.totalScore += this.feedback.score;
    this.totalAnswered++;
    this.averageAccuracy = Math.round(this.totalScore / this.totalAnswered);

    if (this.currentSentenceIdx < this.totalSentences - 1) {
      setTimeout(() => {
        this.currentSentenceIdx++;
        this.answerText = '';
        this.hintVisible = false;
        this.feedback = null;
      }, 1800);
    } else {
      this.showToast('🎉 Bài tập hoàn thành!', 'success');
    }
  }

  toggleHint() {
    this.hintVisible = !this.hintVisible;
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMsg = msg;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  doneSentences(): Sentence[] {
    return this.currentExercise?.sentences.slice(0, this.currentSentenceIdx) || [];
  }

  remainingSentences(): Sentence[] {
    return this.currentExercise?.sentences.slice(this.currentSentenceIdx) || [];
  }

  get accuracyColor(): string {
    if (this.averageAccuracy >= 80) return 'var(--green)';
    if (this.averageAccuracy >= 60) return 'var(--gold)';
    return 'var(--red)';
  }

  get feedbackColor(): string {
    if (!this.feedback) return 'var(--green)';
    if (this.feedback.score >= 80) return 'var(--green)';
    if (this.feedback.score >= 60) return 'var(--gold)';
    return 'var(--red)';
  }

  highlightExample(ex: string, word: string): string {
    return ex.replace(word, '<span class="dict-highlight-word">' + word + '</span>');
  }

  get feedbackScoreLabel(): string {
    if (!this.feedback) return '';
    if (this.feedback.score >= 80) return '✅ Tốt lắm!';
    if (this.feedback.score >= 60) return '⚠️ Khá ổn!';
    return '❌ Cần cải thiện';
  }
}