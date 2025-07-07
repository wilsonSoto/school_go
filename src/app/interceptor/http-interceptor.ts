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
export class HttpInterceptorService implements HttpInterceptor {


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('*************************************')
    // const autReq = req
    // CAMBIO AQUI: Usar una cadena vacía en lugar de null si el token no existe
    const autToken = localStorage.getItem('token') || '';

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: autToken, // Ahora autToken siempre será un string
        // userid: currentUser.id || '', // Si usaras currentUser, también asegúrate de que no sea null
      },
    });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(req, error, '7777777777777777777777777');
        console.log(req, error, '88888888888888888');

        if (
          error instanceof HttpErrorResponse &&
          [401, 403].includes(error.status) &&
          !req.url.includes('/authenticate')
        ) {
          // this.handleUnauthorized(req, next); // Aquí iría tu lógica para 401/403
          console.log(req, error, '99999999999999s');

        }
        throw error;
      })
    );
  }
}
