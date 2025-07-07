import { hostUrlEnum } from './../../types/index';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { hostUrlEnum } from '../../types'
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable()
export class RouteService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    credential: 'same-origin',
  };

  constructor(private httpClient: HttpClient) {

  }


  getRoute(route_id: any = 13) {

console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;')

    // const url =  `${hostUrlEnum.develop}/school/parent/${partner_id}/info`;
    const url =  `${this.appURl}/school/route/${route_id}/info`;

    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

   getAllroute() {

console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;')

    const url =  `${this.appURl}/school/routes`;
    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


  async postParent (data: any) {

    const { form, partner_id, company_id, action } = data;
    const formData = new FormData();

    formData.append('fullName', form.fullName);
    formData.append('login', form.national_id);
    formData.append('password', form.national_id);
    formData.append('phone', form.phone);
    formData.append('mobile', form.mobile);
    formData.append('email', form.email);
    formData.append('national_id', form.national_id);
    formData.append('address', form.address);
    // formData.append('sector', form.sector);
    formData.append('location_latitude', form.location_latitude);
    formData.append('location_longitude', form.location_latitude);
    // formData.append('parentImage', form.parentImage);
    formData.append('responsibleGuardian', form.responsibleGuardian);
    // formData.append('responsibleGuardianImage', form.responsibleGuardianImage);
    // formData.append('nationalIdImage', form.nationalIdImage);
    const images = [
      form.parentImage,
      form.responsibleGuardianImage,
      form.nationalIdImage
    ]
    for (let idx = 0; idx < images.length; idx++) {
      const file = images[idx];

      // let file = form.profile;
      const img = await fetch(file);
      const blob = await img.blob();
      const name = `Foto${idx}.jpg`;
      if (idx == 0) {
        formData.append('parentImage', blob, name);

      } else if (idx == 1) {
        formData.append('responsibleGuardianImage', blob, name);

      } else {
        formData.append('nationalIdImage', blob, name);

      }
    }


    let url = null;
   if (company_id || action == 'edit') {
     url = `${this.appURl}/school/${data.company_id}/parent/signup`;
    } else {
      url = `${this.appURl}/school/parent/${partner_id}/student/`;
    }

    // const url =  `${this.appURl} /school/${company_id}/parent/signup`;
    return this.httpClient.post(url, formData).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

}
