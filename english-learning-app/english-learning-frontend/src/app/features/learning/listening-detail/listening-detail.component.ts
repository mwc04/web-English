import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-listening-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listening-detail.component.html',
  styleUrls: ['./listening-detail.component.css']
})
export class ListeningDetailComponent implements OnInit {
  item: any = null;
  loading = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.fetchDetail(id);
  }

  async fetchDetail(id: string) {
    try {
      const res = await fetch(`http://localhost:5000/api/listening/${id}`);
      const json = await res.json();
      this.item = json.data;
    } catch {}
    this.loading = false;
  }

  get audioUrl(): string {
    if (!this.item?.audio_url) return '';
    if (this.item.audio_type === 'uploaded') return 'http://localhost:5000' + this.item.audio_url;
    return this.item.audio_url;
  }

  back() { this.router.navigate(['/listening']); }
}