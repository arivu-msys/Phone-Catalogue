import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="search-results" style="padding:1rem">
      <h2>Search results for "{{ query }}"</h2>
      <div *ngIf="results?.length; else noResults">
        <ul>
          <li *ngFor="let p of results">{{ p.name }} — {{ p.dealPrice || p.mrp }}</li>
        </ul>
      </div>
      <ng-template #noResults>
        <p>No results found.</p>
      </ng-template>
    </section>
  `,
})
export class SearchResultsComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  query = '';
  results: any[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      this.query = p['q'] || '';
      this.search(this.query);
    });
  }

  private search(q: string) {
    const term = (q || '').trim().toLowerCase();
    if (!term) {
      this.results = [];
      return;
    }
    this.http.get<any[]>('/assets/phones/phones.json').subscribe((data) => {
      this.results = data.filter((x) => (x.name || '').toLowerCase().includes(term));
    });
  }
}
