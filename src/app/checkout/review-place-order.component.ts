import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectFinalTotal } from '../store/cart/cart.selectors';

@Component({
  selector: 'app-review-place-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './review-place-order.component.html',
  styleUrl: './review-place-order.component.scss',
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

  constructor(private fb: FormBuilder, private store: Store) {
    // initialize store-backed observables
    this.cartFinalTotal$ = this.store.select(selectFinalTotal);

    this.reviewForm = this.fb.group({
      agreeToTerms: [false, [Validators.requiredTrue]],
    });
  }

  onPlaceOrder(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    // TODO: hook real order placement here
    console.log('Place order confirmed');
  }
}

