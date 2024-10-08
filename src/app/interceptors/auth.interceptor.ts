import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken(); // Get the JWT token from AuthService

    // If the token exists, clone the request and add the authorization header
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle authorization errors
          if (error.status === 401) {
            // Optionally, you can log out the user or refresh the token
            this.authService.logout();
          }
          return throwError(error);
        })
      );
    }

    return next.handle(req);
  }
}
