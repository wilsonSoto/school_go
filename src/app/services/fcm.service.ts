import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';
import { hostUrlEnum } from 'src/types';
import { catchError, map, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop;

  private _redirect = new BehaviorSubject<any>(null);
  get redirect() {
    return this._redirect.asObservable();
  }
  constructor(
    private storage: StorageService,  
    private toastService: ToastService,
    
    private httpClient: HttpClient
  ) {}

  sendNotification(notificationData: any) {
    const data = {
      params: {
        message: {
          token: notificationData.token,
          //  'ftzFexWbSsS0IOKWb1DNZV:APA91bFd5PxVCS7MLvei7baq5YZYS55FKW49EkfIJBw2_RNzJ0xgU2g3NIsXyGdUqd9y4qa5lXtMUnxhLhjZMW23rHj5EpYPpJMxzKaPHDDNez_itINnPyM',
          notification: {
            body: notificationData.msm, //'This is an FCM notification message!',
            title: notificationData.title //'FCM Message',
          },
        },
      },
    };
    console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;');
    // {{host_local}}/api/school/notification/
    const url = `${this.appURl}/school/notification/`;
    return this.httpClient.post(url, data).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  async initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      console.log('a');
      try {
        await this.registerPush();
      } catch (error) {
        console.log(`Error:${error}`);
      }
      console.log('b');
    }
  }

  private async registerPush() {
    try {
      console.log('step 1');
      this.addListeners();
      console.log('step 2');
      let permStatus = await PushNotifications.checkPermissions();
      console.log('step 3');

      if (permStatus.receive === 'prompt') {
        console.log('step 4');
        permStatus = await PushNotifications.requestPermissions();
        console.log('step 5');
      }

      console.log('step 6');
      if (permStatus.receive !== 'granted') {
        console.log('step 7');
        throw new Error('Usuario ha denegado el permiso de las notificaciones');
      }
      console.log('step 8');

      await PushNotifications.register();
      console.log('step 9');
    } catch (error) {
      console.log('step 10');
      console.log(error);
      console.log(`registration push ${error}`);
    }
  }

  async getDeliveredNotifications() {
    const notificationList =
      await PushNotifications.getDeliveredNotifications();
    console.log('delivered Notifications');
    console.log(notificationList);
  }

  addListeners() {
    console.log(PushNotifications);
    PushNotifications.addListener('registration', async (token: Token) => {
      try {
        console.log('registration 1');
        console.log('My Token: ');
        console.log(JSON.stringify({ token }));
        // alert(JSON.stringify(token))
        const fcmtoken = token?.value;
        let go = 1;
        console.log('registration 2');
        const savedToken = await this.storage.get(hostUrlEnum.FCM_TOKEN);
        console.log('registration 3');
        if (savedToken) {
          if (fcmtoken == savedToken) {
            console.log('same token');
            go = 0;
            console.log('registration 4');
          } else {
            go = 2;
            console.log('registration 5');
          }
        }

        if (go == 1) {
          console.log('registration 6');
          await this.storage.set(hostUrlEnum.FCM_TOKEN, fcmtoken);
        } else if (go == 2) {
          const data = {
            expired_token: savedToken,
            refreshed_token: fcmtoken,
          };
          console.log('registration 7');
          await this.storage.set(hostUrlEnum.FCM_TOKEN, fcmtoken);
          console.log('registration 8');
        }

            this.toastService.presentToast(JSON.stringify(fcmtoken))

      } catch (error) {
        console.log(`Error registration listner, ${error}`);
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log(`ERROR: ${error}`);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        try {
          console.log('Push received: ' + JSON.stringify(notification));
          const data = notification?.data;
          if (data?.redirect) this._redirect.next(data?.redirect);
        } catch (error) {
          console.log(`ERROR pushNotificationReceived ${error}`);
        }
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        try {
          const data = notification.notification.data;
          console.log(
            `Action perfomed: ${JSON.stringify(notification.notification)}`
          );
          console.log('push data ');
          console.log(data);
          if (data?.redirect) this._redirect.next(data?.redirect);
        } catch (error) {
          console.log(`pushNotificationActionPerformed ${error}`);
        }
      }
    );
  }

  async removeFcmToken() {
    try {
      await this.storage.remove(hostUrlEnum.FCM_TOKEN);
    } catch (error) {
      console.log('e');
      console.log(`removeFcmToken ${error}`);
    }
  }
}
