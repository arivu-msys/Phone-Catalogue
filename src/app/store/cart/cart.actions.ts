import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart-item.model';

// New action that updates an existing item (merge) or appends if not present.
export const updateOrAddItem = createAction('[Cart] Update Or Add Item', props<{ item: CartItem }>());
export const removeItem = createAction('[Cart] Remove Item', props<{ productId: string }>());
export const updateQuantity = createAction('[Cart] Update Quantity', props<{ productId: string; quantity: number }>());
export const clearCart = createAction('[Cart] Clear Cart');
export const updateFinalTotal = createAction('[Cart] Update Final Total', props<{ finalTotal: number }>());
export const updatePricing = createAction('[Cart] Update Pricing', props<{ pricing: Partial<any> }>());
