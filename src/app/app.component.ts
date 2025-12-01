
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Phone-Catalogue';

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
}

}
