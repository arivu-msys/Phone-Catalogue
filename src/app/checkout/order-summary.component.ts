import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { selectCartItems, selectCartCount } from '../store/cart/cart.selectors';
import { CartItem } from '../store/cart/cart-item.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';


interface OrderItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  items: OrderItem[] = [
    {
      name: 'Lorem Ipsum Dolor',
      color: 'Black',
      size: 'M',
      quantity: 1,
      price: 89.99,
    },
    {
      name: 'Sit Amet Consectetur',
      color: 'White',
      size: 'L',
      quantity: 2,
      price: 59.99,
    },
  ];
  cartItems$: Observable<CartItem[]>;
  cartCount$: Observable<number>;

  constructor(private store: Store) {
    this.cartItems$= this.store.select(selectCartItems);
    this.cartCount$ = this.store.select(selectCartCount);
  }

  

  

  shipping = 9.99;
  tax = 21.0;

  promoCode = '';

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  onApplyPromo(): void {
    // Placeholder for promo application logic
    console.log('Apply promo code:', this.promoCode);
  }
}

