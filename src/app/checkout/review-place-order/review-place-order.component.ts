import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
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

  constructor(private fb: FormBuilder, private store: Store, private checkoutValidationService: CheckoutValidationService) {
    // initialize store-backed observables
    this.cartFinalTotal$ = this.store.select(selectFinalTotal);

    this.reviewForm = this.fb.group({
      agreeToTerms: [false, [Validators.requiredTrue]],
    });
  }

  // modal state
  isModalOpen = false;
  modalTitle = '';
  // which component to render inside modal: 'privacy' | 'terms' | ''
  modalComponent: 'privacy' | 'terms' | '' = '';

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

    // also ensure agreeToTerms is true
    if (!allValid || this.reviewForm.invalid) {
      // mark this form controls as touched to show errors
      this.reviewForm.markAllAsTouched();
      return;
    }

    // TODO: hook real order placement here
    console.log('Place order confirmed');
  }
}

