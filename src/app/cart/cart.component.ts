import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CartListComponent } from './cart-list/cart-list.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';
import { selectCartCount, selectCartPricing, selectCartTotal } from '../store/cart/cart.selectors';
import { BehaviorSubject, combineLatest, map, firstValueFrom } from 'rxjs';
import * as CartActions from '../store/cart/cart.actions';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartListComponent, CartSummaryComponent, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cartCount$!: Observable<number>;
  cartCount: number = 0;
  // promo handling
  private promoCode$ = new BehaviorSubject<string>('');
  promoCode = '';
  promoError = '';
  promoSuccess = '';
  discount$!: Observable<number>;

  constructor(private router: Router, private store: Store) {
    this.cartCount$ = this.store.select(selectCartCount);

    this.discount$ = combineLatest([this.store.select(selectCartPricing), this.promoCode$]).pipe(
      map(([pricing, code]) => {
        if (!code) return 0;
        return code === pricing?.promoCode ? (pricing.promoDiscountAvailable ?? 0) : 0;
      })
    );

    this.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  async onApplyPromo(): Promise<void> {
    this.promoError = '';
    this.promoSuccess = '';
    this.promoCode$.next(this.promoCode);

    if (!this.promoCode) {
      this.promoError = '';
      this.promoSuccess = '';
      return;
    }

    const pricing = await firstValueFrom(this.store.select(selectCartPricing));
    if (!pricing) {
      this.promoError = 'Pricing not available';
      return;
    }

    if (this.promoCode !== pricing.promoCode) {
      this.promoError = 'Promo code is invalid';
      this.promoSuccess = '';
      // ensure applied discount is 0
      this.store.dispatch(CartActions.updatePricing({ pricing: { appliedPromoDiscount: 0 } }));
    } else {
      this.promoError = '';
      this.promoSuccess = 'Promo code applied successfully';
      // dispatch to update appliedPromoDiscount
      this.store.dispatch(CartActions.updatePricing({ pricing: { appliedPromoDiscount: pricing.promoDiscountAvailable || 0 } }));
    }
  }

  onProceedToCheckout() {
    this.router.navigate(['/checkout']);
  }

  onContinueShopping() {
    this.router.navigate(['/']);
  }
}
