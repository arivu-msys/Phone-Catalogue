import { Component, numberAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CartListComponent } from './cart-list/cart-list.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';
import { selectCartCount } from '../store/cart/cart.selectors';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartListComponent, CartSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cartCount$!: Observable<number>;
  cartCount: number = 0;

  constructor(private router: Router, private store: Store) {
    this.cartCount$ = this.store.select(selectCartCount);

    this.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  onProceedToCheckout() {
    this.router.navigate(['/checkout']);
  }

  onContinueShopping() {
    this.router.navigate(['/']);
  }
}
