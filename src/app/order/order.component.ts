import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { selectCartItems, selectCartPricing } from '../store/cart/cart.selectors';
import { clearCart } from '../store/cart/cart.actions';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent {
  orderNumber: string = '';
  cartItems: any[] = [];
  pricing: any | undefined;

  @ViewChild('recentTrack', { static: false }) recentTrack!: ElementRef<HTMLDivElement>;

  // two additional recently viewed items added
  recentlyViewed = [
    { id: 'dell-venue', name: 'Dell Venue', category: 'Smartphone', image: 'img/phones/dell-venue.0.jpg' },
    { id: 'droid-2-global-by-motorola', name: 'Droid 2 Global', category: 'Smartphone', image: 'img/phones/droid-2-global-by-motorola.0.jpg' },
    { id: 'samsung-galaxy-tab', name: 'Samsung Galaxy Tab', category: 'Tablet', image: 'img/phones/samsung-galaxy-tab.0.jpg' },
    { id: 'nexus-s', name: 'Nexus S', category: 'Smartphone', image: 'img/phones/nexus-s.0.jpg' },
    { id: 'motorola-xoom-with-wi-fi', name: 'Motorola Xoom', category: 'Tablet', image: 'img/phones/motorola-xoom-with-wi-fi.0.jpg' },
    { id: 'lg-axis', name: 'LG Axis', category: 'Smartphone', image: 'img/phones/lg-axis.0.jpg' },
  ];

  // pixels to scroll per arrow click (calculated to show 4 items per slide)
  private scrollByAmount = 0;

  constructor(private store: Store, private router: Router) {
    this.orderNumber = this.generateOrderNumber();

    // Capture current cart items then clear the cart in the store
    firstValueFrom(this.store.select(selectCartItems)).then((items) => {
      this.cartItems = items || [];
      this.store.dispatch(clearCart());
    });

    // Capture pricing if available (non-blocking)
    firstValueFrom(this.store.select(selectCartPricing)).then((p) => (this.pricing = p));
  }

  ngAfterViewInit(): void {
    this.calculateScrollAmount();
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateScrollAmount();
  }

  private calculateScrollAmount(): void {
    try {
      if (!this.recentTrack) return;
      const el = this.recentTrack.nativeElement;
      // Only calculate slide amount for desktop where arrows are visible
      if (window.innerWidth < 768) {
        this.scrollByAmount = 0;
        return;
      }
      // We reserve side margins on the track (CSS) for arrows; el.clientWidth
      // already reflects the visible width available for items, so subtract gaps only.
      const gap = 12 * (4 - 1); // gaps between 4 items
      const available = el.clientWidth - gap;
      // width of 4 items is available; scroll amount should be that width
      this.scrollByAmount = Math.max(0, Math.floor(available));
    } catch (e) {
      this.scrollByAmount = 320;
    }
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  scrollLeft(): void {
    if (!this.recentTrack) return;
    this.recentTrack.nativeElement.scrollBy({ left: -this.scrollByAmount, behavior: 'smooth' });
  }

  scrollRight(): void {
    if (!this.recentTrack) return;
    this.recentTrack.nativeElement.scrollBy({ left: this.scrollByAmount, behavior: 'smooth' });
  }

  getSubtotal(): string {
    const subtotal = (this.cartItems || []).reduce((total: number, item: any) => {
      return total + (item.dealPrice || 0) * (item.quantity || 1);
    }, 0);
    return `$${subtotal.toFixed(2)}`;
  }

  getDiscount(): string {
    const subtotal = (this.cartItems || []).reduce((total: number, item: any) => {
      return total + (item.dealPrice || 0) * (item.quantity || 1);
    }, 0);
    const discount = subtotal > 500 ? 90 : 0;
    return discount === 0 ? '$0.00' : `-$${discount.toFixed(2)}`;
  }

  getOrderTotal(): string {
    const subtotal = (this.cartItems || []).reduce((total: number, item: any) => {
      return total + (item.dealPrice || 0) * (item.quantity || 1);
    }, 0);
    const discount = subtotal > 500 ? 90 : 0;
    const shipping = this.pricing ? this.pricing.shippingPrice || 0 : 0;
    const total = subtotal - discount + shipping;
    return `$${total.toFixed(2)}`;
  }

  private generateOrderNumber(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
}
