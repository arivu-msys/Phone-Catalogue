import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.reducer';

export const selectCartFeature = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(selectCartFeature, (state) => state.items);

export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.dealPrice * i.quantity, 0)
);

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0)
);
