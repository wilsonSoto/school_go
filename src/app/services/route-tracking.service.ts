import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';
import { hostUrlEnum } from '../../types';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable()
export class RouteTrackingService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    credential: 'same-origin',
  };

  constructor(private httpClient: HttpClient) {}

  // getDriverCurrentLocation(route_id: number = 14) {
  //   const url = `${this.appURl}/school/route/${route_id}/current/location`;
  //   return this.httpClient.get(url).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }

  // getTheNextPoint(route_id: number = 14) {
  //   const url = `${this.appURl}/school/route/${route_id}/next_point`;
  //   return this.httpClient.get(url).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }

  // startTheRoute(data: any) {
  //   let url = `${this.appURl}/school/route/${data.route_id}/start`;
  //   const dataRoute = {
  //     params: {
  //       latitude: data.lat, //'18.5200830',
  //       longitude: data.lng // '-69.8727770',
  //     },
  //   };
  //   return this.httpClient.post(url, dataRoute).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }


  // setdriverLocation(data: any) {
  //   // {{host_local}}/api/school/route/14/current/location
  //   let url = `${this.appURl}/school/route/${data.route_id}/current/location`;
  //   const dataRoute = {
  //     params: {
  //       current_latitude: data.lat, //'18.5200830',
  //       current_longitude: data.lng // '-69.8727770',
  //     },
  //   };
  //   return this.httpClient.post(url, dataRoute).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }


  // markARouteAsVisited(data: any) {
  //   // {{host_local}}/api/school/route/14/point/mark_visited
  //   let url = `${this.appURl}/school/route/${data.route_id}/point/mark_visited`;
  //   const dataRoute = {
  //     params: {
  //       point_id: data.point_id, //'18.5200830',
  //     },
  //   };
  //   return this.httpClient.post(url, dataRoute).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }


  // setEndTheRoute(data: any) {
  //   let url = `${this.appURl}/school/route/${data.route_id}/end`;
  //   const dataRoute = {
  //     params: {
  //       latitude: data.lat, //'18.5200830',
  //       longitude: data.lng // '-69.8727770',
  //     },
  //   };
  //   return this.httpClient.post(url, dataRoute).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }


  updateRoute (route_id: any, data: any) {
      let url = `${this.appURl}/school/route/${route_id}/update`;
      // const {name, driverId, busId, schedules }
    const dataRoute = {
      params: {
        "name": data.name,
        "school_driver_id": data.driverId,
        "school_bus_id": data.busId,
        "schedules": data.schedules
    }
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

   updateStudentsInRoute (route_id: any, data: any) {
      let url = `${this.appURl}/school/route/${route_id}/students`;
      // const {name, driverId, busId, schedules }
    const dataRoute = {
      params: {
        "student_ids": data
    }
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

   updatePointsInRoute (route_id: any, data: any) {
      let url = `${this.appURl}/school/route/${route_id}/points/update`;
      // const {name, driverId, busId, schedules }
    const dataRoute = {
      params: {
        "route_points": data
        //  [{
        //     "name": "Prueba ruta",
        //     "visit_order": 2,
        //     "point_latitude": 18.5201320,
        //     "point_longitude": -69.9882560,
        //     "is_student_point": true,
        //     "students": [1528]
        // }]
    }
    };
    return this.httpClient.post(url, dataRoute).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
}
