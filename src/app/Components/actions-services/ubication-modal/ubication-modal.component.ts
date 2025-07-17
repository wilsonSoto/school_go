import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LocationService } from 'src/app/services/geolocation.service';
// import {} from '../../../../assets/images/here.jpg'
@Component({
  standalone: false,
  selector: 'app-ubication-modal',
  templateUrl: './ubication-modal.component.html',
  styleUrls: ['./ubication-modal.component.scss'],
})
export class UbicationModalComponent implements OnInit{
  constructor(private modalCtrl: ModalController,
        private locationService: LocationService,
    private alertController: AlertController,

  ) {}
 ngOnInit(): void {
   console.log('llegueeeeeeeeeeeeeeeeeeeeeeeeeeeeee00');

 }


  async getLocation() {
    try {
      let local = await this.locationService.getCurrentLocation();
      if (!local) {
        local = { latitude: 0, longitude: 0 };
      }
      return local;
    } catch (error) {
      console.log(error);

      return error;
    }
  }

  // async sendLocation() {
  //   try {
  //    const location = await this.getLocation()
  //     console.log('Ubicación enviada:', location);

  //     this.modalCtrl.dismiss(location); // ✅ Solo este botón cierra el modal

  //   } catch (error) {
  //     console.log(error);

  //   }
  // }
  async sendLocation2() {
  try {
    const location = await this.getLocation();
    console.log('Ubicación enviada:', location);

    // Solo se cierra el modal si la ubicación fue obtenida
    this.modalCtrl.dismiss(location);
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    // Muestra un mensaje de error si deseas
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudo obtener la ubicación. Intenta nuevamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}

sendLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      console.log('Ubicación enviada:', location);

      this.modalCtrl.dismiss(location); // ✅ Solo este botón cierra el modal
    },
    (error) => {
      console.error('Error al obtener la ubicación', error);
      // Opcional: puedes mostrar un toast o mensaje de error
    },
    {
      enableHighAccuracy: true,
    }
  );
}


}
