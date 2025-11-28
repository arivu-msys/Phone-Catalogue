export interface CartItem {
  productId: string;
  title: string;
  dealPrice: number | string;
  mrp: number | string;
  quantity: number;
  imageUrl: string;
  item: any;
}
