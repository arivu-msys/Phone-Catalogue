import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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

  // Placeholder total; you can later bind this from parent or service
  totalAmount = 240.96;

  constructor(private fb: FormBuilder) {
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

