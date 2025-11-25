import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="category-page">
      <h2>Category: {{ categoryName }}</h2>
      <div *ngIf="phones?.length; else empty">
        <ul class="phone-list">
          <li *ngFor="let p of phones">{{ p.name }} — {{ p.mrp }}</li>
        </ul>
      </div>
      <ng-template #empty>
        <p>No phones found for this category.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
    .category-page{padding:1rem}
    .phone-list{list-style:none;padding:0}
    .phone-list li{padding:0.35rem 0;border-bottom:1px solid #f1f5f9}
    `,
  ],
})
export class CategoryComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  categoryName = '';
  phones: any[] = [];

  ngOnInit(): void {
    this.route.params.subscribe((p) => {
      this.categoryName = p['name'] || 'All';
      this.loadPhones();
    });
  }

  loadPhones() {
    this.http.get<any[]>('/assets/phones/phones.json').subscribe((data) => {
      if (!this.categoryName || this.categoryName === 'All') {
        this.phones = data;
        return;
      }
      // We treat category as carrier name or 'Other'
      this.phones = data.filter((x) => {
        if (!x.carrier) return this.categoryName === 'Other';
        return x.carrier === this.categoryName;
      });
    });
  }
}
