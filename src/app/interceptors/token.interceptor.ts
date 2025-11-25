import { HttpContextToken, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

// Functional HTTP interceptor that reads a JWT from localStorage and adds it to outgoing requests
export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Read the token from localStorage using the exact key 'authToken'
  const token = localStorage.getItem('authToken');

  // If no token is present, forward the request unchanged
  if (!token) {
    return next(req);
  }
console.log('token ', token)
  // Clone the request and set the Authorization header with the Bearer token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Pass the cloned request to the next handler
  return next(authReq);
};

// Exported helper for convenience when registering with provideHttpClient(withInterceptors(...))
export const provideTokenInterceptor = () => tokenInterceptor;
