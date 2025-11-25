import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './routes';
import { tokenInterceptor } from './interceptors/token.interceptor';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { cartReducer } from './store/cart/cart.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  // Register HttpClient and attach our token interceptor using the modern "withInterceptors" API
  // withInterceptors expects an array of HttpInterceptorFn values.
  provideHttpClient(withInterceptors([tokenInterceptor])),
    // register cart reducer under 'cart'
    provideStore({ cart: cartReducer }),
    // optional: enable devtools (register only in development if desired)
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
