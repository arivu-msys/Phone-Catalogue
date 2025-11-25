import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from './wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wishlist-page">
      <h2>Your Wishlist</h2>
      <div *ngIf="items?.length; else empty">
        <ul class="wishlist-list">
          <li *ngFor="let it of items">
            <img [src]="it.imageUrl ? '/' + it.imageUrl : '/img/phones/placeholder.png'" alt="{{it.name}}" />
            <div class="meta">
              <div class="name">{{ it.name }}</div>
              <div class="price">{{ it.dealPrice || it.mrp }}</div>
            </div>
            <button class="remove-btn" (click)="remove(it.id)">Remove</button>
          </li>
        </ul>
      </div>
      <ng-template #empty>
        <p>No items in wishlist.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .wishlist-page { padding: 1rem }
      .wishlist-list { list-style:none; padding:0; margin:0 }
      .wishlist-list li { display:flex; gap:0.75rem; align-items:center; padding:0.5rem 0; border-bottom:1px solid #eee }
      .wishlist-list img { width:64px; height:64px; object-fit:cover; border-radius:6px }
      .meta .name { font-weight:700 }
      .meta .price { color:#0b5ed7 }
      .remove-btn { margin-left: auto; background: transparent; border: none; color: #e11d48; cursor: pointer }
    `
  ]
})
export class WishlistComponent implements OnInit {
  items: any[] = [];
  ids: string[] = [];
  constructor(private http: HttpClient, private wishlist: WishlistService) {}

  ngOnInit(): void {
    // subscribe to wishlist ids so UI updates when items are added/removed
    this.wishlist.ids$.subscribe((ids) => {
      this.ids = ids || [];
      this._loadItems();
    });
  }

  private _loadItems() {
    this.http.get<any[]>('/assets/phones/phones.json').subscribe(
      (phones) => {
        const map = new Map((phones || []).map((p) => [p?.id, p]));
        this.items = (this.ids || []).map((id) => map.get(id)).filter(Boolean);
      },
      () => (this.items = [])
    );
  }

  remove(id: string) {
    this.wishlist.remove(id);
  }
}
