import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartListComponent } from './cart-list/cart-list.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartListComponent, CartSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  constructor(private router: Router) {}

  onProceedToCheckout() {
    this.router.navigate(['/checkout']);
  }

  onContinueShopping() {
    this.router.navigate(['/']);
  }
}
