import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Hotspot {
  x: number; // percent
  y: number; // percent
  label: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  hotspots?: Hotspot[];
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss']
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  banners: Banner[] = [];
  active = 0;
  prevActive = 0;
  direction: 'left' | 'right' = 'left';
  private timer: any = null;
  // autoplay interval (ms)
  autoplayMs = 10000;
  paused = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadBannersFromPhones();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private loadBannersFromPhones() {
    this.http.get<any[]>('/assets/phones/phones.json').subscribe((phones) => {
      const picks = (phones || []).slice(0, 4);
      const titlePatterns = [
        (name: string) => `Discover the New ${name}`,
        (name: string) => `Introducing ${name}`,
        (name: string) => `Experience ${name}`,
        (name: string) => `Meet ${name}`
      ];

      const hotspotsFor = (id: string) => this.generateHotspotsFor(id);

      this.banners = picks.map((p: any, i: number) => ({
        id: p.id,
        title: (titlePatterns[i] || ((n: string) => n))(p.name || 'Featured Phone'),
        subtitle: i === 0 ? 'New Release' : undefined,
        description: p.snippet ? p.snippet.split('\n')[0] : 'Explore the features and offers',
        imageUrl: p.imageUrl ? '/' + p.imageUrl : undefined,
        category: p.carrier || 'Phones',
        hotspots: hotspotsFor(p.id)
      }));
    });
  }

  // Generate small, repeatable hotspot positions per product id so hotspots vary per banner
  private generateHotspotsFor(id?: string) {
    const seed = (id || 'x').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const rng = (n: number) => (Math.abs(Math.sin(seed + n) * 10000) % 1);
    const labels = ['Key feature', 'Camera', 'Battery'];
    // Keep hotspots closer to the center of the image for better visibility.
    return labels.map((label, i) => ({
      x: 50 + Math.round((rng(i + 1) - 0.5) * 20), // ~40..60
      y: 45 + Math.round((rng(i + 2) - 0.5) * 40), // ~25..65
      label
    })).map(h => ({ x: Math.max(8, Math.min(92, h.x)), y: Math.max(8, Math.min(92, h.y)), label: h.label }));
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => {
      if (!this.paused) this.next();
    }, this.autoplayMs);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next() {
    if (!this.banners || this.banners.length <= 1) return;
    this.prevActive = this.active;
    this.direction = 'left';
    this.active = (this.active + 1) % this.banners.length;
  }

  prev() {
    if (!this.banners || this.banners.length <= 1) return;
    this.prevActive = this.active;
    this.direction = 'right';
    this.active = (this.active - 1 + this.banners.length) % this.banners.length;
  }

  go(i: number) {
    if (i === this.active) return;
    this.prevActive = this.active;
    this.direction = i > this.active ? 'left' : 'right';
    this.active = i;
  }

  onMouseEnter() {
    this.paused = true;
  }

  onMouseLeave() {
    this.paused = false;
  }

  goToPhone(id?: string) {
    if (!id) return;
    this.router.navigate(['/category', id]);
  }

  goToCategory(cat?: string) {
    if (!cat) return;
    this.router.navigate(['/category', cat]);
  }
}
