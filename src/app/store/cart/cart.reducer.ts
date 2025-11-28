import { Action, createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';
import { CartState } from './cart-state.model';

export const initialState: CartState = {
  items: [],
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
  // keep legacy addItem behaviour: append-only
  on(CartActions.addItem, (state, { item }) => ({ ...state, items: [...state.items, { ...item }] })),

  // updateOrAddItem: merge by composite key (productId + options) or append
  on(CartActions.updateOrAddItem, (state, { item }) => {
    const idx = state.items.findIndex(i => i.productId === item.productId);

    // If exists → merge
    if (idx >= 0) {
      const existing = state.items[idx];

      const updatedItem = {
        ...existing,
        ...item,
        quantity: (existing.quantity || 1) + (item.quantity || 1),
        item: item.item || existing.item
      };

      const newItems = [...state.items];
      newItems[idx] = updatedItem;

      return {
        ...state,
        items: newItems
      };
    }

    // If not found → append
    return {
      ...state,
      items: [...state.items, { ...item }]
    };
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
