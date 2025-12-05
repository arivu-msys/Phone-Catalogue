import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { digitsOnly, strictEmail } from '../validators';
import { FormsModule } from '@angular/forms';
import { CheckoutValidationService } from '../services/checkout-validation.service';

@Component({
  selector: 'app-customer-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss'],
})
export class CustomerInformationComponent {
  customerForm: FormGroup;

  customer = { firstName: '', lastName: '', email: '', phone: '' };

  constructor(private fb: FormBuilder, private checkoutValidationService: CheckoutValidationService) {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, strictEmail]],
      phone: ['', [Validators.required, digitsOnly(15)]],
    });
  // register under a key so the review component can read values
  this.checkoutValidationService.registerForm('customer', this.customerForm);
  }
}
