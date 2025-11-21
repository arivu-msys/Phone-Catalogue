import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart-item.model';

export const addItem = createAction('[Cart] Add Item', props<{ item: CartItem }>());
export const removeItem = createAction('[Cart] Remove Item', props<{ productId: string }>());
export const updateQuantity = createAction('[Cart] Update Quantity', props<{ productId: string; quantity: number }>());
export const clearCart = createAction('[Cart] Clear Cart');
