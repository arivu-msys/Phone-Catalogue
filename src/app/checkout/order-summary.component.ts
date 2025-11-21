import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { selectCartItems, selectCartCount, selectCartPricing, selectCartTotal } from '../store/cart/cart.selectors';
import { CartItem } from '../store/cart/cart-item.model';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest, map, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CartPricing } from '../store/cart/cart-pricing.model';
import * as CartActions from '../store/cart/cart.actions';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {

  cartItems$!: Observable<CartItem[]>;
  cartCount$!: Observable<number>;
  cartPricing$!: Observable<CartPricing>;
  cartTotal$!: Observable<number>;

  // reactive promo handling
  private promoCode$ = new BehaviorSubject<string>('');
  promoCode = '';
  promoError = '';

  // derived observables
  discount$!: Observable<number>;
  finalTotal$!: Observable<number>;
  private destroy$ = new Subject<void>();
  constructor(private store: Store) {
  // initialize store-backed observables
  this.cartItems$ = this.store.select(selectCartItems);
  this.cartCount$ = this.store.select(selectCartCount);
  this.cartPricing$ = this.store.select(selectCartPricing);
  this.cartTotal$ = this.store.select(selectCartTotal);

    // discount$ emits promoDiscount only when entered promoCode matches pricing.promoCode
  this.discount$ = combineLatest([this.cartPricing$, this.promoCode$]).pipe(
      map(([pricing, code]) => {
        if (!code) return 0;
        return code === pricing?.promoCode ? (pricing.promoDiscount ?? 0) : 0;
      })
    );


    this.finalTotal$ = combineLatest([
      this.cartTotal$,
      this.cartPricing$,
      this.discount$
    ]).pipe(
      map(([cartTotal, pricing, discount]) => {
        const shipping = pricing?.shippingPrice ?? 0;
        const tax = pricing?.tax ?? 0;
        return cartTotal + shipping + tax - (discount ?? 0);
      }),
      tap(finalTotal => {
        this.store.dispatch(CartActions.updateFinalTotal({ finalTotal }));
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onApplyPromo(): void {
    this.promoError = '';
    // push entered code into reactive stream
    this.promoCode$.next(this.promoCode);

    // validate once to show error message if invalid
    const pricingSnapshot = (pricing: CartPricing | undefined) => {
      if (!this.promoCode) {
        this.promoError = '';
        return;
      }
      if (!pricing) {
        this.promoError = 'Pricing not available';
        return;
      }
      if (this.promoCode !== pricing.promoCode) {
        this.promoError = 'Promo code is invalid';
      } else {
        this.promoError = '';
      }
    };

    // one-time subscription to pricing to set promoError accordingly
    const sub = this.cartPricing$.subscribe((pricing) => {
      pricingSnapshot(pricing);
      sub.unsubscribe();
    });
  }
}

