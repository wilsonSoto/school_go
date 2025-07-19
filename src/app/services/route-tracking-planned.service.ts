import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';
import { hostUrlEnum } from '../../types';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable()
export class RouteTrackingPlannedService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    credential: 'same-origin',
  };

  constructor(private httpClient: HttpClient) {}

  getDriverCurrentLocation(route_id: number = 14) {
    const url = `${this.appURl}/school/route/${route_id}/current/location`;
    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getTheNextPoint(route_id: number = 14) {
    const url = `${this.appURl}/school/route/${route_id}/next_point`;
    return this.httpClient.get(url).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  startTheRoute(data: any) {
    let url = `${this.appURl}/school/route/${data.route_id}/start`;
    const dataRoute = {
      params: {
        latitude: data.lat, //'18.5200830',
        longitude: data.lng // '-69.8727770',
      },
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


  setdriverLocation(data: any) {
    // {{host_local}}/api/school/route/14/current/location
    let url = `${this.appURl}/school/route/${data.route_id}/current/location`;
    const dataRoute = {
      params: {
        current_latitude: data.lat, //'18.5200830',
        current_longitude: data.lng // '-69.8727770',
      },
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


  markARouteAsVisited(route_id: any, data: any) {
    // {{host_local}}/api/school/route/14/point/mark_visited
    let url = `${this.appURl}/school/route/${route_id}/point/mark_visited`;
    const dataRoute = {
      params: data
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


  setEndTheRoute(data: any) {
    let url = `${this.appURl}/school/route/${data.route_id}/end`;
    const dataRoute = {
      params: {
        latitude: data.lat, //'18.5200830',
        longitude: data.lng // '-69.8727770',
      },
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

}
