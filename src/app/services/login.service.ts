import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';

import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { hostUrlEnum } from '../../types'
@Injectable()
export class LoginService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    credential: 'same-origin',
  };

  constructor(private httpClient: HttpClient) {}


  login(dataLogin: any) {

    const params = {
      "params": dataLogin
    }
    const url = this.appURl +'/authenticate';
    return this.httpClient.post(url, params).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


}
