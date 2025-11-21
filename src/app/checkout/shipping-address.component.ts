import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './shipping-address.component.html',
  styleUrl: './shipping-address.component.scss',
})
export class ShippingAddressComponent {
  shippingForm: FormGroup;

  shipping = {
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    saveForFuture: false,
    billingSameAsShipping: true,
  };

  constructor(private fb: FormBuilder) {
    this.shippingForm = this.fb.group({
      streetAddress: ['', [Validators.required]],
      apartment: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      saveForFuture: [false],
      billingSameAsShipping: [true],
    });
  }
}

