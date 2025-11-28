import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CartItem } from '../../store/cart/cart-item.model';
import { selectCartItems } from '../../store/cart/cart.selectors';
import * as CartActions from '../../store/cart/cart.actions';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss'],
})
export class CartListComponent {
  cartItems$!: Observable<CartItem[]>;

  constructor(private store: Store) {
    this.cartItems$ = this.store.select(selectCartItems);
  }

  remove(productId: string) {
    this.store.dispatch(CartActions.removeItem({ productId }));
  }

  changeQuantity(productId: string, quantity: number) {
    this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
  }
}
