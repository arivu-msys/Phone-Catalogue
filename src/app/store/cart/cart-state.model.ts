import { CartItem } from "./cart-item.model";
import { CartPricing } from "./cart-pricing.model";

export interface CartState {
  items: CartItem[];
  pricing: CartPricing;
  finalTotal?: number;
}