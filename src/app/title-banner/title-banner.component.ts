import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-title-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './title-banner.component.html',
  styleUrls: ['./title-banner.component.scss']
})
export class TitleBannerComponent {
  @Input() pageTitle: string | null = '';

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
