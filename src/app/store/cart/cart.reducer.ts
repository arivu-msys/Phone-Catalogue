import { Action, createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';
import { CartState } from './cart-state.model';

export const initialState: CartState = {
  items: [
     {
       productId: 'P001',
       title: 'motorola-xoom.0',
       dealPrice: 2499,
       mrp: 2999,
       quantity: 1,
       imageUrl: 'img/phones/motorola-xoom.0.jpg',
       item: {}
     },
     {
       productId: 'P002',
       title: 'dell-streak-7.0',
       dealPrice: 3500,
       mrp: 4000,
       quantity: 2,
       imageUrl: 'img/phones/dell-streak-7.0.jpg',
       item: {}
     }
   ],
  pricing: {
    promoCode: '123',
    promoDiscountAvailable: 200,
    appliedPromoDiscount: 0,
    shippingPrice: 0,
    tax: 40
  }
};

const _cartReducer = createReducer(
  initialState,
  on(CartActions.addItem, (state, { item }) => {
    const existing = state.items.find((i) => i.productId === item.productId);
    if (existing) {
      // increase quantity
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      };
    }

    return { ...state, items: [...state.items, { ...item }] };
  }),

  on(CartActions.removeItem, (state, { productId }) => ({
    ...state,
    items: state.items.filter((i) => i.productId !== productId),
  })),

  on(CartActions.updateQuantity, (state, { productId, quantity }) => ({
    ...state,
    items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
  })),

  on(CartActions.updatePricing, (state, { pricing }) => ({
    ...state,
    pricing: { ...state.pricing, ...(pricing as any) },
  })),

  on(CartActions.clearCart, () => initialState)
  ,
  on(CartActions.updateFinalTotal, (state, { finalTotal }) => ({
  ...state,
  finalTotal
}))
);

export function cartReducer(state: CartState | undefined, action: Action) {
  return _cartReducer(state, action);
}
