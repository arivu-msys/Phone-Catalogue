

import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'category/:name',
    loadComponent: () => import('./category/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./search-results/search-results.component').then((m) => m.SearchResultsComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./wishlist/wishlist.component').then((m) => m.WishlistComponent),
  },
];

