import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from '../wishlist/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // controls whether the mobile slide-down search is visible
  isSearchOpen = false;
  // controls whether the mobile menu is open
  isMenuOpen = false;

  // reference to desktop search input to focus when clicking desktop search icon
  @ViewChild('desktopSearch', { read: ElementRef }) desktopSearch?: ElementRef<HTMLInputElement>;

  // categories loaded from assets/categories.json (objects with optional children)
  categories: Array<{ name: string; children?: Array<{ name: string }> }> = [];

  // track which mobile submenu indexes are expanded
  expandedSubmenus = new Set<number>();
  
  // phones data used for autosuggest
  phones: Array<any> = [];

  // autosuggest lists and query state for desktop and mobile
  desktopSuggestions: Array<any> = [];
  mobileSuggestions: Array<any> = [];
  desktopQuery = '';
  mobileQuery = '';
  // index for keyboard navigation (desktop)
  desktopActiveIndex = -1;
  // debounce timers
  private desktopTimer: any = null;
  private mobileTimer: any = null;

  // Reference to the host element to detect outside clicks and HttpClient to load JSON
  constructor(private hostRef: ElementRef<HTMLElement>, private http: HttpClient, private router: Router, private wishlist: WishlistService) {}

  // Navigate to wishlist page (template-friendly)
  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  // Toggle the mobile search panel
  toggleMobileSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  // Toggle mobile off-canvas menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Focus the central desktop search input
  focusDesktopSearch() {
    try {
      this.desktopSearch?.nativeElement.focus();
    } catch (e) {
      // ignore
    }
  }

  // Load category list from assets/categories.json; fallback to phones.json derived carriers if missing
  private loadCategories() {
    this.http.get<any[]>('/assets/categories.json').subscribe(
      (data) => {
        // expect data to be array of { name, children? }
        this.categories = data.map((c) => c);
      },
      () => {
        // fallback: derive from phones.json
        this.http.get<any[]>('/assets/phones/phones.json').subscribe((data) => {
          const set = new Set<string>();
          for (const p of data) {
            if (p.carrier) set.add(p.carrier);
          }
          const carriers = Array.from(set).sort();
          const hasOther = data.some((p) => !p.carrier);
          this.categories = [{ name: 'All' }, ...carriers.map((c) => ({ name: c }))];
          if (hasOther) this.categories.push({ name: 'Other' });
        });
      }
    );
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPhones();
  }

  // Load phones.json for autosuggest
  private loadPhones() {
    this.http.get<any[]>('/assets/phones/phones.json').subscribe((data) => {
      this.phones = data || [];
    });
  }

  // Load category map (optional) to map categories -> phone ids
  private loadCategoryMap(): Promise<Record<string, string[]>> {
    return new Promise((res) => {
      this.http.get<Record<string, string[]>>('/assets/category-map.json').subscribe(
        (m) => res(m || {}),
        () => res({})
      );
    });
  }

  // Close the search panel
  closeSearch() {
    this.isSearchOpen = false;
  }

  // Called on search submit (both mobile and desktop) - navigate to /search?q=...
  onSearch(query: string | undefined) {
    const q = (query || '').trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
    // close mobile search after navigating
    this.isSearchOpen = false;
  }

  // Autosuggest handlers
  onDesktopInput(value: string) {
    // debounce to avoid too many filters while typing
    clearTimeout(this.desktopTimer);
    this.desktopTimer = setTimeout(() => {
      this.desktopQuery = value || '';
      const term = this.desktopQuery.trim().toLowerCase();
      if (!term) {
        this.desktopSuggestions = [];
        this.desktopActiveIndex = -1;
        return;
      }
      this.desktopSuggestions = this.phones
        .filter((p) => (p.name || '').toLowerCase().includes(term))
        .slice(0, 8);
      this.desktopActiveIndex = -1;
    }, 180);
  }

  onMobileInput(value: string) {
    clearTimeout(this.mobileTimer);
    this.mobileTimer = setTimeout(() => {
      this.mobileQuery = value || '';
      const term = this.mobileQuery.trim().toLowerCase();
      if (!term) {
        this.mobileSuggestions = [];
        return;
      }
      this.mobileSuggestions = this.phones
        .filter((p) => (p.name || '').toLowerCase().includes(term))
        .slice(0, 6);
    }, 180);
  }

  // Select suggestion from dropdown; target can be 'desktop' or 'mobile'
  selectSuggestion(item: any, target: 'desktop' | 'mobile') {
    if (!item) return;
    // If the suggestion has a product id, navigate to the product details page.
    if (item.id) {
      this.router.navigate(['/product', item.id]);
    } else {
      const q = item?.name || '';
      if (!q) return;
      this.router.navigate(['/search'], { queryParams: { q } });
    }
    this.desktopSuggestions = [];
    this.mobileSuggestions = [];
    this.isSearchOpen = false;
  }

  // wishlist helpers used from template
  isInWishlist(id: string) {
    return this.wishlist.has(id);
  }

  toggleWishlistFor(item: any, event?: MouseEvent) {
    if (!item || !item.id) return;
    if (event) event.stopPropagation();
    this.wishlist.toggle(item.id);
  }

  // Desktop keyboard navigation for suggestions
  onDesktopKeydown(e: KeyboardEvent) {
    if (!this.desktopSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.desktopActiveIndex = Math.min(this.desktopActiveIndex + 1, this.desktopSuggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.desktopActiveIndex = Math.max(this.desktopActiveIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = this.desktopSuggestions[this.desktopActiveIndex] || this.desktopSuggestions[0];
      if (sel) this.selectSuggestion(sel, 'desktop');
    }
  }

  // helper: categories excluding Home to avoid duplicate Home link
  get categoriesNoHome() {
    return this.categories.filter((c) => (c.name || '').toLowerCase() !== 'home');
  }

  // Toggle mobile submenu by index
  toggleSubmenu(i: number) {
    if (this.expandedSubmenus.has(i)) this.expandedSubmenus.delete(i);
    else this.expandedSubmenus.add(i);
  }

  // Listen for document clicks and close the mobile search/menu if click is outside this component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (this.isSearchOpen && target && !this.hostRef.nativeElement.contains(target)) {
      this.isSearchOpen = false;
    }
    if (this.isMenuOpen && target && !this.hostRef.nativeElement.contains(target)) {
      this.isMenuOpen = false;
    }
    // Hide autosuggest lists when clicking outside the header
    if (target && !this.hostRef.nativeElement.contains(target)) {
      this.desktopSuggestions = [];
      this.desktopActiveIndex = -1;
      this.mobileSuggestions = [];
    }
  }
}
