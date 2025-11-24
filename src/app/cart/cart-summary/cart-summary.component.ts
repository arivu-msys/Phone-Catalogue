import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCartPricing, selectCartTotal } from '../../store/cart/cart.selectors';
import { CartPricing } from '../../store/cart/cart-pricing.model';
import * as CartActions from '../../store/cart/cart.actions';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
})
export class CartSummaryComponent {
  @Output() proceed = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();

  cartPricing$!: Observable<CartPricing | undefined>;
  cartTotal$!: Observable<number>;
  selectedShipping: 'standard' | 'express' | 'free' = 'standard';

  ngOnInit(): void {
    // set default shipping based on cart total
    this.cartTotal$.pipe(take(1)).subscribe((total) => {
      if (total >= 300) {
        this.onShippingChange('free');
      } else {
        this.onShippingChange('standard');
      }
    });
  }

  constructor(private store: Store) {
    this.cartPricing$ = this.store.select(selectCartPricing);
    this.cartTotal$ = this.store.select(selectCartTotal);
  }

  onProceed() {
    this.proceed.emit();
  }

  onShippingChange(kind: 'standard' | 'express' | 'free') {
    this.selectedShipping = kind;
    const price = kind === 'standard' ? 4.99 : kind === 'express' ? 12.99 : 0;
    this.store.dispatch(CartActions.updatePricing({ pricing: { shippingPrice: price } }));
  }
}
