import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerInformationComponent } from './customer-information/customer-information.component';
import { ShippingAddressComponent } from './shipping-address/shipping-address.component';
import { PaymentComponent } from './payment/payment.component';
import { ReviewPlaceOrderComponent } from './review-place-order/review-place-order.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    CustomerInformationComponent,
    ShippingAddressComponent,
    PaymentComponent,
    ReviewPlaceOrderComponent,
    OrderSummaryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {}

