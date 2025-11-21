import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

export type PaymentMethod = 'card' | 'paypal' | 'applePay';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
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

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      method: ['card', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      expiry: ['', [Validators.required]],
      cvv: ['', [Validators.required]],
      nameOnCard: ['', [Validators.required]],
    });
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

