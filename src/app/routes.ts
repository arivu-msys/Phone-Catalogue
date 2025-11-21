import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then((m) => m.CartComponent),
  },
];

