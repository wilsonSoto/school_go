import { Subscription, fromEvent, merge, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

 export async function checkNetworkStatus() {
    let networkStatus = navigator.onLine;
   let networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
      .pipe(map(() => navigator.onLine))
      .subscribe((status: any) => {
        networkStatus = status;
        return status;
      });
    return networkStatus;
  }
