import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastCtrl: ToastController
  ) {}

  async presentToast(msm: string, style: any = 'custom-danger-toast', time: number = 2000) {
   const qtyTime =  style == 'custom-danger-toast' ? null : time
const cssStyle = style == 1 ? 'custom-success-toast' : style
    const toast = await this.toastCtrl.create({
      message: msm,
      cssClass: cssStyle,
      buttons: [
        {
          icon: 'close',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
      ],
    });

    if (qtyTime) {
      toast.duration =qtyTime;

    }

    await toast.present();
  }

}
