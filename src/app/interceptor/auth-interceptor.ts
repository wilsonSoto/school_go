import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable } from 'rxjs';


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {


   intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
console.log('[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[');

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
            console.log(req,error , '0000000000000000000000err');
        // if (req.headers.has('Auth')) {
            console.log(req,error , 'http11111111');

          if (
            error instanceof HttpErrorResponse &&
            [401, 403].includes(error.status) &&
            !req.url.includes('/authenticate')
          ) {
            // this.handleUnauthorized(req, next);
            console.log(req,error , 'http');

          }
        // }

        throw error;
      })
    );
  }
}
