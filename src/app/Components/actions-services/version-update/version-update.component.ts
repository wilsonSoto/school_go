import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonContent } from "@ionic/angular/standalone";
import { environment } from 'src/environments/environment.prod';
// import {} from '../../../../assets/images/logo.png'
@Component({
  standalone: false,
  selector: 'app-version-update',
  templateUrl: './version-update.component.html',
  styleUrls: ['./version-update.component.scss'],
})
export class VersionUpdateComponent {
  appVersion: string = environment.version; // versión local
  latestVersion: string = ''; // esto puede venir de un backend
  oldVersion: string = environment.oldVersion; // esto puede venir de un backend
  forceUpdate: boolean = true; // si se requiere forzar el update

  constructor(private platform: Platform) {}

  ionViewDidEnter() {
    // Aquí podrías hacer una petición al backend para obtener la última versión
    // y comparar con la actual.
    this.checkVersion();
  }

  checkVersion() {
    if (this.appVersion !== this.latestVersion && this.forceUpdate) {
      console.log('Se requiere actualizar la app');
      // Si deseas cerrar la app si no actualiza (opcional):
      // this.platform.backButton.subscribeWithPriority(9999, () => {
      //   navigator['app'].exitApp();
      // });
    }
  }

  goToPlayStore() {
    window.open('https://play.google.com/store/apps/details?id=TU_ID', '_system');
  }

  goToAppStore() {
    window.open('https://apps.apple.com/app/idTU_ID', '_system');
  }
}
