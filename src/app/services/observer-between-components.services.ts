import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ObserverBetweenComponentsService {
  private sourceMessage = new BehaviorSubject<any>(null);
  currentMessage = this.sourceMessage.asObservable();

  changeMessage(message: any) {
    this.sourceMessage.next(message);
  }

  // private sendDriverLocation = new BehaviorSubject<any>(null);
  // currentDriverLocation = this.sendDriverLocation.asObservable();

  // changeDriverLocation(message: any) {
  //   this.sendDriverLocation.next(message);
  // }

  // private driverLocationSubject = new BehaviorSubject<any | null>(null);
  // driverLocation$ = this.driverLocationSubject.asObservable();

  // changeDriverLocation(location: any) {
  //   this.driverLocationSubject.next(location);
  // }

  private driverLocationSubject = new BehaviorSubject<any | null>(null);
driverLocation$ = this.driverLocationSubject.asObservable();

changeDriverLocation(position: any) {
  this.driverLocationSubject.next(position);
}

}
