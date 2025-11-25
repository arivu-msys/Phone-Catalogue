import { Component } from '@angular/core';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';
import { CustomerFeaturesComponent } from '../customer-features/customer-features.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeroBannerComponent, CustomerFeaturesComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {}
