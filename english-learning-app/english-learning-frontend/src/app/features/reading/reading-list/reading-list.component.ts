import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningTrackerService } from '../../../core/services/learning-tracker.service';

@Component({
  selector: 'app-reading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.css']
})
export class ReadingListComponent implements OnInit, OnDestroy {
  showModal = false;
  modalVideoTitle = '';

  mediaLevel = 2;
  mediaActiveTag = 'Movie short clip';

  mediaTags = [
    "Movie short clip","Daily English Conversation","Learning resources",
    "Listening Time (Shadowing)","IELTS Listening","Entertainment","Kids",
    "US UK songs","TOEIC Listening","VOA Learning English","BBC learning english",
    "Toefl Listening","Science and Facts","Fairy Tales","Podcast","IPA",
    "Food & Drink","Tutorial","News","Vietnam Today","TED","Travel vlog",
    "Animals and wildlife","Short Story","Business English"
  ];

  mediaSections: Record<string, { count: number; items: any[] }> = {
    "Movie short clip": {
      count: 158,
      items: [
        { title:"PRINCESS MONONOKE | Official English Trailer", level:"A2", views:"35,140", duration:"01:04", pro:true, emoji:"🐺", bg:"#c8f0d0" },
        { title:"KIKI'S DELIVERY SERVICE | Official English Trailer", level:"B1", views:"50,249", duration:"00:50", emoji:"🧙‍♀️", bg:"#fde8c8" },
        { title:"Toy Story Tribute", level:"B2", views:"21,707", duration:"01:53", emoji:"🤠", bg:"#dceeff" },
        { title:"Stranger Things 5 | Official Trailer | Netflix", level:"B1", views:"15,592", duration:"02:55", emoji:"👦", bg:"#2a2a2a", darkThumb:true },
      ]
    },
    "Daily English Conversation": {
      count: 149,
      items: [
        { title:"Morning Routine — Everyday English", level:"A2", views:"77,877", duration:"03:12", emoji:"☀️", bg:"#fff3c4" },
        { title:"At the Coffee Shop — Natural Conversation", level:"A2", views:"21,316", duration:"02:45", emoji:"☕", bg:"#f0e0ff" },
        { title:"Job Interview Practice — Intermediate", level:"B1", views:"17,987", duration:"05:20", pro:true, emoji:"👔", bg:"#c4e8ff" },
        { title:"Talking About Your Hobbies — Beginner", level:"A1", views:"62,114", duration:"02:10", emoji:"🎨", bg:"#d4f5e0" },
      ]
    },
    "IELTS Listening": {
      count: 87,
      items: [
        { title:"IELTS Listening Practice Test — Full 40 Mins", level:"B2", views:"44,892", duration:"40:00", emoji:"📋", bg:"#ffe4e4" },
        { title:"IELTS Section 2 — Tour Guide Monologue", level:"B1", views:"18,230", duration:"08:30", emoji:"🗺️", bg:"#e4f0ff" },
        { title:"Academic Word List — Listening Exercise", level:"B2", views:"9,540", duration:"12:15", pro:true, emoji:"🔤", bg:"#f0ffe4" },
        { title:"IELTS Section 1 — Conversation Practice", level:"B1", views:"27,610", duration:"06:50", emoji:"📞", bg:"#ffefd4" },
      ]
    },
  };

  constructor(private router: Router, private learningTracker: LearningTrackerService) {}

  ngOnInit() {
    this.fetchMediaVideos();
    this.learningTracker.startTracking('reading');
  }

  ngOnDestroy() {
    this.learningTracker.endSession().subscribe();
  }

  async fetchMediaVideos() {
    try {
      const res = await fetch('http://localhost:5000/api/media-videos');
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success) return;
      const videos: any[] = json.data || [];
      for (const v of videos) {
        const cat = v.category || 'Other';
        if (this.mediaSections[cat]) {
          this.mediaSections[cat].items.unshift(v);
          this.mediaSections[cat].count = this.mediaSections[cat].items.length;
        } else {
          this.mediaSections[cat] = { count: 1, items: [v] };
        }
      }
    } catch {}
  }

  getYoutubeThumbnail(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
    }
    return null;
  }

  get mediaSectionKeys(): string[] {
    return Object.keys(this.mediaSections);
  }

  getFilteredItems(items: any[]): any[] {
    if (this.mediaLevel === 1) {
      return items.filter(v => ['A1','A2'].includes(v.level));
    }
    return items.filter(v => !['A1','A2'].includes(v.level));
  }

  levelClass(l: string): string {
    return 'badge-' + l.toLowerCase();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.showModal) {
      this.showModal = false;
      document.body.style.overflow = '';
    }
  }

  openMedia(title: string) {
    this.showModal = true;
    this.modalVideoTitle = title;
    document.body.style.overflow = 'hidden';
  }

  startMode(mode: string, title: string) {
    this.showModal = true;
    this.modalVideoTitle = title;
    document.body.style.overflow = 'hidden';
  }

  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).closest('.modal-box')) return;
    this.showModal = false;
    document.body.style.overflow = '';
  }

  chooseMode(mode: string) {
    this.showModal = false;
    document.body.style.overflow = '';
    if (mode === 'Bắt chước phát âm') {
      this.router.navigate(['/reading/shadowing'], { queryParams: { title: this.modalVideoTitle } });
    } else {
      alert(`Bắt đầu ${mode}!`);
    }
  }

  seeAll(name: string) {
    alert(`Xem tất cả: ${name}`);
  }
}
