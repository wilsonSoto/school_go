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

  private isFetchingOdoo = new BehaviorSubject<boolean>(false);
  currentFetching = this.isFetchingOdoo.asObservable();

  changeFetching(message: boolean) {
    this.isFetchingOdoo.next(message);
  }
}
