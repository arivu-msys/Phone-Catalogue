
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UserService } from './core/services/user.service';
import { TitleBannerComponent } from './title-banner/title-banner.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TitleBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Phone-Catalogue';
  pageTitle: string | null = '';

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}
  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    let token = params['token'];

    // 1. If token comes from URL, store it for future requests
    if (token) {
      try {
        localStorage.setItem('authToken', token);
      } catch {}
    }

    // 2. If token not in URL, try from localStorage
    if (!token) {
      token = localStorage.getItem('authToken') || null;
    }

    if (!token) {
      return; // No token anywhere → just stop
    }

    // --- Safe JWT Decode ---
    const decodeJwtPayload = (tok: string): any | null => {
      try {
        const parts = tok.split('.');
        if (parts.length < 2) return null;

        // Base64URL → Base64
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

        const jsonString = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    };

    const decoded = decodeJwtPayload(token);

    const uname =
      decoded?.name ||
      decoded?.username ||
      decoded?.sub ||
      null;

    if (uname) {
      this.userService.setUserName(String(uname));
    }

    // 3. If token came from URL, remove it from the URL
    if (params['token']) {
      this.router.navigate([], {
        queryParams: { token: null },
        queryParamsHandling: 'merge'
      });
    }
  });

  // update page title on navigation end using route data.title or the last path segment
  this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
    try {
      const root = this.router.routerState.root;
      let route: any = root;
      let lastTitle = '';
      while (route.firstChild) {
        route = route.firstChild;
      }
      // prefer route data.title if provided
      lastTitle = (route.snapshot && route.snapshot.data && route.snapshot.data['title']) || '';
      if (!lastTitle) {
        // fallback to path segment
        const seg = route.snapshot?.url?.map((s: any) => s.path).join('/') || '';
        lastTitle = seg ? seg.replace(/-/g, ' ') : '';
      }
      this.pageTitle = lastTitle || 'Home';
    } catch {
      this.pageTitle = this.title;
    }
  });
}

}
