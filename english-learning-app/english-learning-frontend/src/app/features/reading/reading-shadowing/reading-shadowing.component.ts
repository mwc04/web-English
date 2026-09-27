import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reading-shadowing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reading-shadowing.component.html',
  styleUrls: ['./reading-shadowing.component.css']
})
export class ReadingShadowingComponent implements OnInit {
  videoTitle = '';
  currentSentence = 1;
  isPlaying = false;
  isRecording = false;
  speedIndex = 2;
  speeds = [0.5, 0.75, 1, 1.25, 1.5];
  progress = 21;

  sentences = [
    { id:1, en:"Hello! Come in, please.", vi:"Xin chào! Mời vào." },
    { id:2, en:"Mom, this is my classmate, Peter.", vi:"Mẹ ơi, đây là bạn học của con, Peter." },
    { id:3, en:"Welcome, Peter. Nice to meet you.", vi:"Chào Peter. Rất vui được gặp cháu." },
    { id:4, en:"Nice to meet you, too.", vi:"Cháu cũng rất vui được gặp bác ạ." },
    { id:5, en:"This is for you.", vi:"Cái này dành cho bác ạ." },
    { id:6, en:"Thank you.", vi:"Cảm ơn cháu." },
    { id:7, en:"What's this?", vi:"Cái gì đây?" },
    { id:8, en:"It's a gift from my family.", vi:"Đây là quà từ gia đình con ạ." },
    { id:9, en:"How lovely! Thank you so much.", vi:"Đáng yêu quá! Cảm ơn cháu nhiều lắm." },
  ];

  wordIpa: Record<string, string> = {
    "Mom,":"/mɑm/", "Mom":"/mɑm/", "this":"/ðɪs/", "is":"/ɪz/", "my":"/maɪ/",
    "classmate,":"/ˈklæs.meɪt/", "classmate":"/ˈklæs.meɪt/",
    "Peter.":"/ˈpiː.tər/", "Peter":"/ˈpiː.tər/",
    "Welcome,":"/ˈwel.kəm/", "Welcome":"/ˈwel.kəm/",
    "Nice":"/naɪs/", "to":"/tuː/", "meet":"/miːt/", "you.":"/juː/", "you,":"/juː/", "you":"/juː/",
    "too.":"/tuː/", "too":"/tuː/",
    "This":"/ðɪs/", "for":"/fɔːr/",
    "Thank":"/θæŋk/",
    "What's":"/wɒts/", "this?":"/ðɪs/",
    "It's":"/ɪts/", "a":"/ə/", "gift":"/ɡɪft/", "from":"/frɒm/", "family.":"/ˈfæm.ɪ.li/",
    "Hello!":"/həˈloʊ/", "Come":"/kʌm/", "in,":"/ɪn/", "please.":"/pliːz/",
    "How":"/haʊ/", "lovely!":"/ˈlʌv.li/", "much.":"/mʌtʃ/",
  };

  activeTab: 'transcript' | 'ipa' | 'trans' = 'transcript';
  autoStop = true;
  bigVideo = false;

  private progressInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.videoTitle = params['title'] || 'B1L1 Dialogue 1';
    });
  }

  get currentSentenceData() {
    return this.sentences.find(s => s.id === this.currentSentence);
  }

  get currentWords(): { word: string; ipa: string }[] {
    const s = this.currentSentenceData;
    if (!s) return [];
    return s.en.split(' ').map(w => ({
      word: w,
      ipa: this.wordIpa[w] || '/' + w.replace(/[^a-z]/gi,'').toLowerCase() + '/'
    }));
  }

  goBack() {
    this.location.back();
  }

  selectSentence(id: number) {
    this.currentSentence = id;
    setTimeout(() => {
      const el = document.getElementById('tc-' + id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  prevSentence() {
    if (this.currentSentence > 1) this.selectSentence(this.currentSentence - 1);
  }

  nextSentence() {
    if (this.currentSentence < this.sentences.length) this.selectSentence(this.currentSentence + 1);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) this.simulateProgress();
    else clearInterval(this.progressInterval);
  }

  private simulateProgress() {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (!this.isPlaying) { clearInterval(this.progressInterval); return; }
      this.progress = Math.min(this.progress + 0.3, 100);
      if (this.progress >= 100) {
        clearInterval(this.progressInterval);
        this.isPlaying = false;
      }
    }, 200);
  }

  seekVideo(event: MouseEvent) {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    this.progress = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  }

  replaySentence() {
    this.progress = Math.max(0, this.progress - 8);
  }

  cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
  }

  toggleRecord() {
    this.isRecording = !this.isRecording;
  }

  replayRecording() {
    const btn = document.getElementById('replayBtn');
    if (btn) {
      btn.style.color = '#2563eb';
      btn.style.borderColor = '#2563eb';
      setTimeout(() => { btn.style.color = ''; btn.style.borderColor = ''; }, 1500);
    }
  }

  switchTab(tab: 'transcript' | 'ipa' | 'trans') {
    this.activeTab = tab;
  }

  get currentTime(): string {
    const total = 34;
    const cur = Math.round(total * this.progress / 100);
    return `0:${String(cur).padStart(2,'0')} / 0:${total}`;
  }
}
