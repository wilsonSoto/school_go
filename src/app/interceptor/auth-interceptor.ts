import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const authReq = token
        
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 0) {
              console.error('⚠️ Sesión expirada o usuario no logueado');
              this.authService.logout();
              this.router.navigate(['/sign-in']);
            }
            if ( [400].includes(error.status)) {
              console.error('⚠️ Sesión expirada o usuario no logueado');

              this.authService.logout();
                  this.router.navigateByUrl('/sign-in', { replaceUrl: true });
                  
                        }
            return throwError(() => error);
          })
        );
      })
    );
  }
}
