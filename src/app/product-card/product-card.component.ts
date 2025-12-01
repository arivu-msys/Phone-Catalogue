import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../wishlist/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="pc-card">
      <div class="pc-card__media" style="position:relative">
        <img [src]="imageSrc()" [alt]="product.name" />
        <button type="button" class="wish-btn" (click)="toggleWishlist($event)" [attr.aria-label]="isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'" style="position:absolute;top:8px;right:8px;">
          <span [class.faved]="isInWishlist()">♥</span>
        </button>
      </div>
      <div class="pc-card__body">
        <h3 class="pc-card__title">{{ product.name }}</h3>
        <div class="pc-card__meta">{{ product.brand || product.category }}</div>
  <div class="pc-card__price">{{ (product.dealPrice ?? product.price ?? product.mrp) | currency: 'USD':'symbol' }}</div>
        <div class="pc-card__actions">
          <a [routerLink]="['/product', product.id || product.slug || product.name]" class="btn btn-outline-primary">View Details</a>
        </div>
      </div>
    </article>
  `,
  styles: [
    `:host{display:block} .pc-card{background:#fff;border-radius:8px;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease;display:flex;flex-direction:column;height:100%}
    .pc-card:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 8px 22px rgba(0,0,0,.12)}
    .pc-card__media{background:#f7f7f7;display:flex;align-items:center;justify-content:center;padding:1rem 1rem;height:160px}
    .pc-card__media img{max-width:100%;max-height:100%;object-fit:contain}
    .pc-card__body{padding:0.85rem 1rem;display:flex;flex-direction:column;gap:.5rem;flex:1}
    .pc-card__title{font-size:1rem;margin:0;color:#111}
    .pc-card__meta{font-size:.85rem;color:#666}
    .pc-card__price{font-weight:700;color:#0b5ed7}
    .pc-card__actions{margin-top:auto;display:flex;justify-content:center}
    .pc-card__actions a.btn{font-size:.9rem;padding:.5rem .75rem;min-width:120px}
    /* wishlist heart in card */
    .wish-btn{background:rgba(255,255,255,0.9);border:0;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:6px;width:34px;height:34px;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
    .wish-btn:hover{transform:scale(1.06);box-shadow:0 6px 14px rgba(11,94,215,0.12)}
    .wish-btn span{display:inline-block;font-size:14px;line-height:1;color:transparent;-webkit-text-stroke:1px #0b5ed7;transition:color .12s ease,-webkit-text-stroke-color .12s ease}
    .wish-btn:hover span{color:#0b5ed7;-webkit-text-stroke-color:transparent}
    .wish-btn span.faved{color:#0b5ed7;-webkit-text-stroke-color:transparent}
    `,
  ],
})
export class ProductCardComponent {
  @Input() product: any = {};

  constructor(private wishlist: WishlistService) {}

  isInWishlist(): boolean {
    return !!(this.product && this.product.id && this.wishlist.has(this.product.id));
  }

  toggleWishlist(e: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.product && this.product.id) this.wishlist.toggle(this.product.id);
  }

  imageSrc() {
    const img = this.product?.imageUrl || (this.product?.images && this.product.images[0]) || 'img/phones/placeholder.png';
    // ensure single leading slash
    if (!img) return '/img/phones/placeholder.png';
    return img.startsWith('/') ? img : '/' + img;
  }
}
