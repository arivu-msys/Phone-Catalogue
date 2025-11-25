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
}
