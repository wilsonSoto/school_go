import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastCtrl: ToastController
  ) {}

  async presentToast(msm: string, style: string = 'custom-danger-toast', time: number = 2000) {
    const toast = await this.toastCtrl.create({
      message: msm,
      duration: time,
      cssClass: style,
      buttons: [
        {
          icon: 'close',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
      ],
    });
    await toast.present();
  }

}