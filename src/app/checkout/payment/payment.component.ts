import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CheckoutValidationService } from '../services/checkout-validation.service';

export type PaymentMethod = 'card' | 'paypal' | 'applePay';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  paymentForm: FormGroup;

  selectedMethod: PaymentMethod = 'card';

  payment = {
    method: 'card' as PaymentMethod,
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  };

  constructor(private fb: FormBuilder, private checkoutValidationService: CheckoutValidationService) {
    this.paymentForm = this.fb.group({
      method: ['card', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      expiry: ['', [Validators.required]],
      cvv: ['', [Validators.required]],
      nameOnCard: ['', [Validators.required]],
    });
    this.checkoutValidationService.registerForm(this.paymentForm);
  }

  setMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.payment.method = method;
    this.paymentForm.patchValue({ method });
  }

  isCardSelected(): boolean {
    return this.selectedMethod === 'card';
  }
}
