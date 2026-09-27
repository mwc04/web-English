import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface VocabCard {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
}

@Component({
  selector: 'app-vocabulary-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocabulary-detail.component.html',
  styleUrls: ['./vocabulary-detail.component.css']
})
export class VocabularyDetailComponent implements OnInit {
  topicTitle = '';
  cards: VocabCard[] = [];
  currentIndex = 0;
  isFlipped = false;
  learnedIds = new Set<string>();
  isFinished = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const category = decodeURIComponent(params['id'] || '');
      this.topicTitle = category;
      this.fetchVocabularies(category);
    });
  }

  async fetchVocabularies(category: string) {
    this.loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/vocabularies');
      const json = await res.json();
      const items: any[] = json.data || [];
      this.cards = items
        .filter((i: any) => (i.category || 'General') === category)
        .map((i: any, idx: number) => ({
          id: i._id || String(idx),
          word: i.word,
          pronunciation: i.pronunciation || '',
          meaning: i.meaning,
          example: i.example || '',
        }));
      this.reset();
    } catch {}
    this.loading = false;
  }

  get currentCard(): VocabCard | null {
    return this.cards[this.currentIndex] ?? null;
  }

  get totalWords(): number {
    return this.cards.length;
  }

  get learnedWords(): number {
    return this.learnedIds.size;
  }

  get progress(): number {
    return this.totalWords ? Math.round((this.learnedWords / this.totalWords) * 100) : 0;
  }

  get studiedWords(): number {
    return this.currentIndex + 1;
  }

  flipCard() {
    if (!this.isFinished) {
      this.isFlipped = !this.isFlipped;
    }
  }

  markRemembered() {
    if (this.currentCard && !this.isFinished) {
      this.learnedIds.add(this.currentCard.id);
      this.nextCard();
    }
  }

  markForgotten() {
    if (!this.isFinished) {
      this.nextCard();
    }
  }

  nextCard() {
    this.isFlipped = false;
    if (this.currentIndex < this.totalWords - 1) {
      this.currentIndex++;
    } else {
      this.isFinished = true;
    }
  }

  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.isFinished = false;
    }
  }

  reset() {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.learnedIds.clear();
    this.isFinished = false;
  }

  goBack() {
    this.router.navigate(['/vocabulary']);
  }
}
