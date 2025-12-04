import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { SearchService, Phone } from './search.service';
import { ProductCardComponent } from '../product-card/product-card.component';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | '';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <section class="search-results site-container">
      <div class="search-results__header">
        <h2 class="search-results__title">Results for "{{ query$ | async }}" <span class="results-count">({{ (filtered$ | async)?.length || 0 }})</span></h2>
        <div class="search-results__controls">
          <label class="sort">Sort:
            <select class="form-select form-select-sm" [value]="(sort$ | async)" (change)="setSort($any($event.target).value)">
              <option value="">Relevance</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
          </label>
          <button class="btn btn-primary mobile-filter-btn" (click)="toggleMobileFilters()">Filters</button>
        </div>
      </div>

      <ng-container *ngIf="filtered$ | async as items">
        <div class="search-results__body">
          <aside class="filters" *ngIf="items.length" [class.open]="mobileFiltersOpen">
          <div class="filters__inner">
            <div class="filters__header">
              <h5>Filters</h5>
              <button class="btn btn-sm btn-outline-primary" (click)="clearFilters()">Clear Filters</button>
            </div>

              <section class="filter-group">
                <h6>Carrier</h6>
                <div *ngFor="let c of (availableCarriers$ | async)">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" [checked]="isCarrierSelected(c)" (change)="toggleCarrier(c)" />
                    <span class="form-check-label">{{ c }}</span>
                  </label>
                </div>
              </section>

              <section class="filter-group">
                <h6>Brand</h6>
                <div *ngFor="let b of (availableBrands$ | async)">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" [checked]="isBrandSelected(b)" (change)="toggleBrand(b)" />
                    <span class="form-check-label">{{ b }}</span>
                  </label>
                </div>
              </section>

              <section class="filter-group">
                <h6>Screen Size</h6>
                <div *ngFor="let s of (availableScreens$ | async)">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" [checked]="isScreenSelected(s)" (change)="toggleScreen(s)" />
                    <span class="form-check-label">{{ s }}</span>
                  </label>
                </div>
              </section>

            <!-- Category filter removed per UI update -->
          </div>
        </aside>

          <main class="results">
            <div *ngIf="items.length; else noResults">
              <div class="grid">
                <app-product-card *ngFor="let p of items" [product]="p"></app-product-card>
              </div>
            </div>
            <ng-template #noResults>
              <div class="no-results">No results found.</div>
            </ng-template>
          </main>
        </div>
        <div class="filters-backdrop" *ngIf="mobileFiltersOpen" (click)="toggleMobileFilters()"></div>
      </ng-container>
    </section>
  `,
  styles: [
    `:host{display:block}
    .search-results__header{display:flex;justify-content:space-between;align-items:center;margin:1rem 0}
    .search-results__title{margin:0;font-size:1.25rem}
    .search-results__title .results-count{font-weight:400;color:#666;margin-left:.5rem;font-size:.95rem}
    .search-results__controls{display:flex;gap:.75rem;align-items:center}
    .mobile-filter-btn{display:none}
    .search-results__body{display:flex;gap:1rem}
    .filters{width:260px;background:#fff;border-radius:8px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:transform .28s ease,opacity .2s}
    .filters.open{position:fixed;left:0;top:80px;bottom:12px;z-index:60}
    .filters__header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
    .filter-group{margin:0.6rem 0}
    .results{flex:1; margin: 40px auto;}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    @media (min-width:1200px){.grid{grid-template-columns:repeat(4,1fr)}}
    @media (max-width:900px){
      .search-results__body{flex-direction:column}
      /* keep filters in DOM so we can animate; hide visually by translating left */
      .filters{display:block;position:fixed;left:0;top:80px;bottom:12px;transform:translateX(-120%);width:calc(100% - 2rem);max-width:340px;opacity:0}
      .filters.open{transform:translateX(0);opacity:1;box-shadow:0 12px 32px rgba(0,0,0,.22);z-index:70}
      .mobile-filter-btn{display:inline-block}
      .grid{grid-template-columns:repeat(2,1fr)}
      .filters-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:60}
    }
    @media (max-width:480px){.grid{grid-template-columns:repeat(1,1fr)}}
    .no-results{padding:2rem;text-align:center;color:#666}
    `,
  ],
})
export class SearchResultsComponent {
  constructor() {
    // listen for brand/carrier query params and set initial filters
    this.route.queryParams.subscribe((p) => {
      const brandParam = p['brand'] || p['b'];
      const carrierParam = p['carrier'] || p['c'];

      const brands = brandParam
        ? Array.isArray(brandParam)
          ? brandParam.map((x: any) => String(x).trim()).filter(Boolean)
          : String(brandParam).split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const carriers = carrierParam
        ? Array.isArray(carrierParam)
          ? carrierParam.map((x: any) => String(x).trim()).filter(Boolean)
          : String(carrierParam).split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      this.selectedBrands$.next(brands);
      this.selectedCarriers$.next(carriers);
    });
  }
  private svc = inject(SearchService);
  private route = inject(ActivatedRoute);

  // UI state
  mobileFiltersOpen = false;

  // selections
  private selectedBrands$ = new BehaviorSubject<string[]>([]);
  private selectedCarriers$ = new BehaviorSubject<string[]>([]);
  private selectedScreens$ = new BehaviorSubject<string[]>([]);
  private selectedCategories$ = new BehaviorSubject<string[]>([]);
  sort$ = new BehaviorSubject<SortOption>('');

  // query from route
  query$: Observable<string> = this.route.queryParams.pipe(map((p) => (p['query'] || p['q'] || '') as string));

  // phones stream
  phones$ = this.svc.phones$ as Observable<Phone[]>;
  // phones filtered by query or current selected filters (used to compute available filter options)
  filteredForOptions$ = combineLatest([this.phones$, this.query$, this.selectedBrands$, this.selectedCarriers$, this.selectedScreens$]).pipe(
    map(([phones, q, selBrands, selCarriers, selScreens]) => {
      const term = (q || '').trim().toLowerCase();
      const hasSel = (selBrands && selBrands.length) || (selCarriers && selCarriers.length) || (selScreens && selScreens.length);
      if (!term && !hasSel) return phones.slice();
      return phones.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const carrier = (p.carrier || '').toLowerCase();
        const screen = (p.screenSize || '').toLowerCase();
        // match text query
        if (term && (name.includes(term) || brand.includes(term) || (p.category || '').toLowerCase().includes(term) || carrier.includes(term))) return true;
        // match selected brand/carrier/screen
        if (selBrands && selBrands.length && selBrands.map((s) => s.toLowerCase()).includes(brand)) return true;
        if (selCarriers && selCarriers.length && selCarriers.map((s) => s.toLowerCase()).includes(carrier)) return true;
        if (selScreens && selScreens.length && selScreens.map((s) => s.toLowerCase()).includes(screen)) return true;
        return false;
      });
    })
  );

  // Available filter option lists (derived from query-matching phones only so options won't lead to 0 results)
  availableCarriers$ = this.filteredForOptions$.pipe(
    map((list) => Array.from(new Set(list.map((x) => (x.carrier || '').trim()).filter(Boolean))).sort())
  );
  availableBrands$ = this.filteredForOptions$.pipe(
    map((list) => Array.from(new Set(list.map((x) => (x.brand || '').trim()).filter(Boolean))).sort())
  );
  availableScreens$ = this.filteredForOptions$.pipe(
    map((list) => Array.from(new Set(list.map((x) => (x.screenSize || '').trim()).filter(Boolean))).sort())
  );

  // categories from category or fallback to brand
  categories$ = this.filteredForOptions$.pipe(
    map((list) => Array.from(new Set(list.map((x) => (x.category || x.brand || '').trim()).filter(Boolean))).sort())
  );

  // final filtered + sorted results
  filtered$ = combineLatest([
    this.phones$,
    this.query$,
    this.selectedCarriers$,
    this.selectedBrands$,
    this.selectedCategories$,
    this.selectedScreens$,
    this.sort$,
  ]).pipe(
    map(([phones, q, carriers, brands, categories, screens, sort]) => {
      const term = (q || '').trim().toLowerCase();
      let items = phones.slice();
      if (term) {
        items = items.filter((p) =>
          (p.name || '').toLowerCase().includes(term) || (p.brand || '').toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term) || (p.carrier || '').toLowerCase().includes(term)
        );
      }
      if (carriers.length) {
        items = items.filter((p) => carriers.includes(((p.carrier || p.brand) || '').trim()));
      }
      if (brands.length) {
        items = items.filter((p) => brands.includes((p.brand || '').trim()));
      }
      if (categories.length) {
        items = items.filter((p) => categories.includes((p.category || '').trim()));
      }
      if (screens.length) {
        items = items.filter((p) => screens.includes((p.screenSize || '').trim()));
      }

      // sort
      items.sort((a, b) => {
        switch (sort) {
          case 'price-asc':
            return (a.dealPrice ?? a.price ?? a.mrp ?? 0) - (b.dealPrice ?? b.price ?? b.mrp ?? 0);
          case 'price-desc':
            return (b.dealPrice ?? b.price ?? b.mrp ?? 0) - (a.dealPrice ?? a.price ?? a.mrp ?? 0);
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '');
          default:
            return 0;
        }
      });

      return items;
    })
  );

  // helpers for template
  isBrandSelected(b: string) {
    return this.selectedBrands$.value.includes(b);
  }
  isCategorySelected(c: string) {
    return this.selectedCategories$.value.includes(c);
  }

  isCarrierSelected(c: string) {
    return this.selectedCarriers$.value.includes(c);
  }

  isScreenSelected(s: string) {
    return this.selectedScreens$.value.includes(s);
  }

  toggleBrand(b: string) {
    const cur = new Set(this.selectedBrands$.value);
    if (cur.has(b)) cur.delete(b);
    else cur.add(b);
    this.selectedBrands$.next(Array.from(cur));
  }

  toggleCarrier(c: string) {
    const cur = new Set(this.selectedCarriers$.value);
    if (cur.has(c)) cur.delete(c);
    else cur.add(c);
    this.selectedCarriers$.next(Array.from(cur));
  }

  toggleScreen(s: string) {
    const cur = new Set(this.selectedScreens$.value);
    if (cur.has(s)) cur.delete(s);
    else cur.add(s);
    this.selectedScreens$.next(Array.from(cur));
  }

  toggleCategory(c: string) {
    const cur = new Set(this.selectedCategories$.value);
    if (cur.has(c)) cur.delete(c);
    else cur.add(c);
    this.selectedCategories$.next(Array.from(cur));
  }

  clearFilters() {
    this.selectedBrands$.next([]);
    this.selectedCarriers$.next([]);
    this.selectedScreens$.next([]);
    this.selectedCategories$.next([]);
    this.sort$.next('');
  }

  setSort(v: SortOption) {
    this.sort$.next(v);
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }
}
