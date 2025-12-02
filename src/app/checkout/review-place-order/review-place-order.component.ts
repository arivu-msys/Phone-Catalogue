import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart/cart.actions';
import { Observable, map } from 'rxjs';
import { OrderService, Order } from '../services/order.service';
import { Router } from '@angular/router';
import { CheckoutValidationService } from '../services/checkout-validation.service';
import { selectFinalTotal } from '../../store/cart/cart.selectors';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-review-place-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TermsConditionsComponent, PrivacyPolicyComponent],
  templateUrl: './review-place-order.component.html',
  styleUrls: ['./review-place-order.component.scss'],
})
export class ReviewPlaceOrderComponent {
  reviewForm: FormGroup;

  review = {
    agreeToTerms: false,
  };

  // bind pricing from store
  cartFinalTotal$!: Observable<number | undefined>;

  // expose final total for template async use
  finalTotal$!: Observable<number | undefined>;

  constructor(
    private fb: FormBuilder,
    private checkoutValidationService: CheckoutValidationService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // initialize store-backed observables
    this.cartFinalTotal$ = this.store.select(selectFinalTotal);

    this.reviewForm = this.fb.group({
      agreeToTerms: [false, [Validators.requiredTrue]],
    });
  }

  // NgRx store using functional inject() as requested
  private store = inject(Store);

  // UI error message shown when submission fails
  errorMessage: string | null = null;

  // modal state
  isModalOpen = false;
  modalTitle = '';
  // which component to render inside modal: 'privacy' | 'terms' | ''
  modalComponent: 'privacy' | 'terms' | '' = '';

  // submission UI state
  isSubmitting = false;
  submitSpinner = false;

  openModal(title: string, type: 'privacy' | 'terms') {
    this.modalTitle = title;
    this.modalComponent = type;
    this.isModalOpen = true;
  }

  acceptModal() {
    console.log('acceptModal called');
    this.isModalOpen = false;
    this.modalComponent = '';
    this.reviewForm.get('agreeToTerms')?.setValue(true);
    this.cleanupBootstrapBackdrop();
  }

  cancelModal() {
    console.log('cancelModal called');
    this.isModalOpen = false;
    this.modalComponent = '';
    this.reviewForm.get('agreeToTerms')?.setValue(false);
    this.cleanupBootstrapBackdrop();
  }

  private cleanupBootstrapBackdrop() {
    try {
      // remove modal-open class from body (in case Bootstrap JS added it)
      document.body.classList.remove('modal-open');
      // remove any lingering backdrop elements
      const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
      backdrops.forEach((b) => b.parentElement?.removeChild(b));
    } catch (e) {
      // ignore in server-side or restricted environments
    }
  }

  onPlaceOrder(): void {
    // validate child forms registered via validation service
    const allValid = this.checkoutValidationService.validateAll();

    // also ensure agreeToTerms is true (review form)
    if (!allValid || this.reviewForm.invalid) {
      // mark this form controls as touched to show errors
      this.reviewForm.markAllAsTouched();
      // scroll to first invalid control and focus it (do not show spinner or call API)
      this.scrollToFirstError();
      return;
    }

    // Build the typed Order object from registered forms
    const customerForm = this.checkoutValidationService.getForm('customer');
    const shippingForm = this.checkoutValidationService.getForm('shipping');
    const paymentForm = this.checkoutValidationService.getForm('payment');

    if (!customerForm || !shippingForm || !paymentForm) {
      // forms are missing; do not proceed
      console.error('One or more checkout forms are missing');
      return;
    }

    // Fetch cart items from localStorage 'cart'
    let items: any[] = [];
    let pricing: any = {};
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsed = JSON.parse(cartData);
        if (parsed && parsed.items && Array.isArray(parsed.items)) {
          items = parsed.items;
        } else if (Array.isArray(parsed)) {
          items = parsed;
        }
        pricing = parsed.pricing;
      }
    } catch (e) {
      console.warn('Could not parse cart items from localStorage', e);
    }


    const order: Order = {
      customer: { ...(customerForm.value || {}) },
      shipping: { ...(shippingForm.value || {}) },
      payment: { ...(paymentForm.value || {}) },
      items: items,
      pricing: pricing
    };

    // prevent duplicate submits and show spinner inside button
    this.isSubmitting = true;
    this.submitSpinner = true;

    this.orderService.placeOrder(order).subscribe({
      next: (resp: any) => {
        try {
          sessionStorage.setItem('orderResponse', JSON.stringify(resp.receivedData));
        } catch (e) {
          console.warn('Could not persist order response to sessionStorage', e);
        }
        // clear cart via NgRx action, then navigate home
        try {
          this.store.dispatch(CartActions.clearCart());
        } catch (e) {
          console.warn('Could not dispatch clearCart', e);
        }
        this.cdr.detectChanges();
        this.router.navigate(['/order']).catch((navErr) => {
          console.error('Navigation to /home failed', navErr);
          // if navigation fails, re-enable UI so user can retry
          this.isSubmitting = false;
          this.submitSpinner = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Order placement failed', err);
        // do NOT clear the cart; show an error message and restore UI so user can retry
        this.errorMessage = 'Some issue while booking. Please try again!';
        this.isSubmitting = false;
        this.submitSpinner = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Find the first invalid control across the registered checkout forms (customer, shipping, payment)
   * and the local review form, scroll it into view smoothly and focus it.
   */
  scrollToFirstError(): void {
    // helper to focus and scroll an element
    const focusAndScroll = (el: Element | null) => {
      if (!el) return;
      try {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        // focus after a short delay so browsers complete the scroll first
        setTimeout(() => { try { (el as HTMLElement).focus(); } catch (e) {} }, 300);
      } catch (e) {
        // ignore
      }
    };

    // 1) Check the local review form (agreeToTerms) first
    if (this.reviewForm && this.reviewForm.invalid) {
      const el = document.getElementById('agreeToTerms') || document.querySelector('[formcontrolname="agreeToTerms"]');
      focusAndScroll(el);
      return;
    }

    // 2) Check registered checkout forms in logical order
    const order = ['customer', 'shipping', 'payment'];
    for (const formName of order) {
      const fg = this.checkoutValidationService.getForm(formName);
      if (!fg) continue;
      const invalidControl = Object.keys(fg.controls).find((c) => fg.get(c)?.invalid);
      if (!invalidControl) continue;

      // Attempt to find the control element in the DOM by common selectors
      // Prefer formControlName attribute which Angular adds to inputs
      const selector = `[formcontrolname="${invalidControl}"]`;
      let el = document.querySelector(selector) as Element | null;
      if (!el) {
        el = document.querySelector(`[name="${invalidControl}"]`) as Element | null;
      }
      if (!el) {
        el = document.getElementById(invalidControl) as Element | null;
      }

      focusAndScroll(el);
      return;
    }
  }
}

