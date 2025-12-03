import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-features.component.html',
  styleUrls: ['./customer-features.component.scss']
})
export class CustomerFeaturesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) root!: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!('IntersectionObserver' in window)) {
      // fallback: add class immediately
      this.root.nativeElement.classList.add('in-view');
      return;
    }

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.root.nativeElement.classList.add('in-view');
          if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
          }
        }
      });
    }, { threshold: 0.12 });

    this.observer.observe(this.root.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  // Modal state
  modalOpen = false;
  modalTitle = '';
  modalBody = '';

  // feature details used by the modal
  featureDetails: Array<{ title: string; desc: string; body: string }> = [
    {
      title: 'Free Shipping',
      desc: 'Fast, reliable delivery to your doorstep with tracking and easy returns.',
      body: `We offer free standard shipping on most orders. Orders are processed within 24 hours and you will receive a tracking number once your package ships. If you need to return an item, our easy returns process ensures a full refund within 30 days — no questions asked.`
    },
    {
      title: 'Money Back Guarantee',
      desc: 'Not satisfied? Return within 30 days for a full refund — no questions asked.',
      body: `Your satisfaction is our priority. If the product doesn't meet expectations, start a return within 30 days and we will issue a full refund after the item is received. Contact our support for assistance with returns, exchanges or refunds.`
    },
    {
      title: 'Discount Offers',
      desc: 'Regular deals and seasonal promotions to get the best prices on top phones.',
      body: `We run regular promotions across brands and categories. Sign up for our newsletter to get early access to deals and exclusive coupon codes. Offers may vary by region and are subject to availability.`
    },
    {
      title: '24/7 Support',
      desc: 'Our customer care team is ready to help you anytime via chat or phone.',
      body: `Need help? Our support team is available 24/7 via live chat and phone. We can help with order status, troubleshooting, returns, and warranty queries. We also provide product setup guidance and usage tips.`
    }
  ];

  openModalFor(index: number) {
    const f = this.featureDetails[index];
    if (!f) return;
    this.modalTitle = f.title;
    this.modalBody = f.body;
    this.modalOpen = true;
    // prevent body scroll when modal open
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
  }

  closeModal() {
    this.modalOpen = false;
    try { document.body.style.overflow = ''; } catch (e) {}
  }
}
