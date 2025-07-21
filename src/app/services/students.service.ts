import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';
import { hostUrlEnum } from '../../types';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable()
export class StudentsService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    credential: 'same-origin',
  };

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService
  ) {}

  getStudents() {
    const url = this.appURl + '/school/student/1536/info';
    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllStudents() {

    const url = this.appURl + '/school/students/';
    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  async postStudent(data: any) {
    const { form, partner_id, studen_id, action } = data;
    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('birth_date_timestamp', form.birth_date_timestamp);
    formData.append('phone', form.phone);
    formData.append('allergies_or_illness', form.allergies_or_illness);
    formData.append('active', form.active);
    formData.append('sex', form.sex);
    formData.append('full_address', form.full_address);
    formData.append('home_latitude', form.home_latitude);
    formData.append('home_longitude', form.home_longitude);
    formData.append('father_name', form.father_name);
    formData.append('mother_name', form.mother_name);

    let file = form.profile;
    const img = await fetch(file);
    const blob = await img.blob();
    const name = `Foto.jpg`;
    formData.append('profile', blob, name);

    let url = null;
    if (studen_id || action == 'edit') {
      url = `${this.appURl}/school/parent/${partner_id}/student/${studen_id}`;
    } else {
      url = `${this.appURl}/school/parent/${partner_id}/student/`;
    }

    return this.httpClient.post(url, formData).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updateStudentLocation(students: any) {
    const url = this.appURl + '/school/students/';
    const data = {
      params: [
        {
          id: students.id,
          home_latitude: students.home_latitude,
          home_longitude: students.home_longitude,
        },
      ],
    };
    return this.httpClient.post(url, data).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
}
