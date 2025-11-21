import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCartPricing, selectCartTotal } from '../../store/cart/cart.selectors';
import { CartPricing } from '../../store/cart/cart-pricing.model';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
})
export class CartSummaryComponent {
  @Output() proceed = new EventEmitter<void>();

  cartPricing$!: Observable<CartPricing | undefined>;
  cartTotal$!: Observable<number>;

  constructor(private store: Store) {
    this.cartPricing$ = this.store.select(selectCartPricing);
    this.cartTotal$ = this.store.select(selectCartTotal);
  }

  onProceed() {
    this.proceed.emit();
  }
}
