import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RuntimeConfigLoaderService } from '../core/services/runtime-config-loader.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  thumbnails: string[] = [];
  mainImage: string | null = null;
  quantity = 1;
  // zoom panel state (Amazon-style zoom on the right)
  zoomVisible = false;
  zoomStyle: { [key: string]: string } = {};
  zoomLevel = 2; // zoom multiplier for the zoom panel
  zoomPanelWidth = 420; // px width of the right-side zoom panel
  // rotation state
  rotateAngle = 0; // degrees
  autoRotate = false;

  // tabs
  selectedTab: 'description' | 'specs' | 'reviews' = 'description';

  // rating (dummy)
  rating = 4; // out of 5
  // configuration selections
  selectedColor: string | null = null;
  selectedStorage: string | null = null;
  // default options (Apple-like)
  colorOptions: string[] = ['pink', 'silver', 'gold', 'blue'];
  storageOptions: string[] = ['128 gb', '255 gb'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private runtimeConfig: RuntimeConfigLoaderService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    // Prefer runtime API if apiBaseUrl is configured at runtime
    const apiBaseUrl = this.runtimeConfig.get('apiBaseUrl');
    this.http.get<any>(`${apiBaseUrl}/api/phones/${id}`).subscribe(
      (detail) => {
        this.product = detail;
        this.handleLoadedDetail(detail);
      },
      (err) => {
        console.warn('Failed to load product from API, falling back to local assets:', err);
      }
    );
    return;
  }

  

  // Shared handler to set up images and options when detail is loaded from API
  private handleLoadedDetail(detail: any) {
    if (Array.isArray(detail.images) && detail.images.length) {
      this.thumbnails = detail.images.slice();
      this.mainImage = this.thumbnails[0];
    } else if (detail.imageUrl) {
      const base = detail.imageUrl.replace(/\.0\.jpg$/, '');
      this.thumbnails = [];
      for (let i = 0; i < 4; i++) {
        this.thumbnails.push(base + '.' + i + '.jpg');
      }
      this.mainImage = detail.imageUrl || this.thumbnails[0] || null;
    }

    if (detail?.color && Array.isArray(detail.color) && detail.color.length) {
      this.colorOptions = detail.color.slice();
    }
    if (detail?.storage && Array.isArray(detail.storage) && detail.storage.length) {
      this.storageOptions = detail.storage.slice();
    }
    if (!this.selectedColor && this.colorOptions.length) this.selectedColor = this.colorOptions[0];
    if (!this.selectedStorage && this.storageOptions.length) this.selectedStorage = this.storageOptions[0];
  }

  setMainImage(url: string) {
    this.mainImage = url;
  }

  rotate90() {
    this.rotateAngle = (this.rotateAngle + 90) % 360;
  }

  toggleAutoRotate() {
    const wrap = document.querySelector('.product-details .img-wrap') as HTMLElement | null;
    if (!this.autoRotate) {
      // enable smooth CSS animation (class binding handles adding .spinning)
      this.autoRotate = true;
    } else {
      // stop smooth animation and return image to default (0deg)
      this.autoRotate = false;
      // clear any inline transform on wrapper
      if (wrap) {
        wrap.style.transform = 'none';
      }
      // animate the image back to 0
      this.rotateAngle = 0;
    }
  }

  resetRotation() {
    // stop any auto-rotation and reset base angle
    const wrap = document.querySelector('.product-details .img-wrap') as HTMLElement | null;
    if (wrap) {
      wrap.style.transform = 'none';
    }
    this.rotateAngle = 0;
    this.autoRotate = false;
  }

  applyImageTransform() {
    // no-op: rotation now bound in template via [style.transform]
  }

  setTab(tab: 'description' | 'specs' | 'reviews') {
    this.selectedTab = tab;
  }

  setRating(value: number) {
    this.rating = value;
  }

  showZoom(event: MouseEvent) {
    if (!this.mainImage) return;
    this.zoomVisible = true;
    this.updateZoom(event);
  }

  hideZoom() {
    this.zoomVisible = false;
  }

  updateZoom(event: MouseEvent) {
    if (!this.mainImage) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left; // x within element
    const y = event.clientY - rect.top; // y within element

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // background-size in pixels to create a crisp zoom (width*zoomLevel x height*zoomLevel)
    const bgWidth = Math.round(rect.width * this.zoomLevel);
    const bgHeight = Math.round(rect.height * this.zoomLevel);

    // Set style for the right-side zoom panel: size and which part of the image to show
    this.zoomStyle = {
      'background-image': `url(${this.mainImage})`,
      'background-position': `${xPercent}% ${yPercent}%`,
      'background-size': `${bgWidth}px ${bgHeight}px`,
      'width': `${this.zoomPanelWidth}px`,
      'height': `${rect.height}px`,
    };
  }

  increment() {
    this.quantity++;
  }

  decrement() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    const parts: string[] = [];
    if (this.selectedColor) parts.push(`Color: ${this.selectedColor}`);
    if (this.selectedStorage) parts.push(`Storage: ${this.selectedStorage}`);
    const cfg = parts.length ? ` (${parts.join(' | ')})` : '';
    alert(`${this.product?.name} (x${this.quantity})${cfg} added to cart`);
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  selectStorage(storage: string) {
    this.selectedStorage = storage;
  }
}
