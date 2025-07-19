// import { Component, OnDestroy, OnInit } from '@angular/core';
// // import { ClientServices } from '../services/clients.services';
// import { NavigationEnd, Router } from '@angular/router';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { AlertController } from '@ionic/angular';
// import { filter } from 'rxjs';
// import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouteService } from '../services/route.service';
import { ToastService } from '../services/toast.service';

import { Component, OnInit } from '@angular/core'; // <--- ASEGÚRATE DE QUE 'Component' ESTÉ IMPORTADO AQUÍ
  import { ModalController } from '@ionic/angular';
import { UbicationModalComponent } from '../Components/actions-services/ubication-modal/ubication-modal.component';
import { StorageService } from '../services/storage.service';
import { hostUrlEnum } from 'src/types';

@Component({
  // <--- ESTE DECORADOR ES PROBABLEMENTE EL QUE FALTA O ESTÁ MAL ESCRITO
  standalone: false,
  selector: 'app-tab3', // O el selector que tengas definido para tu página
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  school_routes: any = [];
  token = ""
  constructor(
    private routeService: RouteService,
    private toastService: ToastService,
    private router: Router,
    private modalController: ModalController,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
  const self = this
    // this.getAllRoute();
      this.storage.get(hostUrlEnum.FCM_TOKEN).then((resp) => {
        self.token = JSON.stringify(resp)
      })
    
  }


  async openModalUbicacion() {
      console.log('Ubicación recibida desde modal+++++++++++++++++++:');

    const modal = await this.modalController.create({
      component: UbicationModalComponent,
      // component: UbicacionModalComponent,
  cssClass: 'full-screen-modal',
  breakpoints: [0, 1],
  initialBreakpoint: 1,
    backdropDismiss: false, // ❌ No se puede cerrar tocando afuera
  canDismiss: false

    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('Ubicación recibida desde modal:', data);
      // Aquí puedes guardar la ubicación o usarla en el mapa
    }
  }
  ionViewWillEnter() {
        // this.openModalUbicacion()

    console.log('Tab3Page: ionViewWillEnter - La página va a ser visible');
    this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
  }

  // Este se llama cada vez que la página ha entrado completamente en la vista.
  ionViewDidEnter() {
    console.log('Tab3Page: ionViewDidEnter - La página ya es visible');
    // Puedes poner lógica que dependa de que la vista esté completamente renderizada.
    // this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
  }

  // Este se llama cada vez que la página está a punto de salir de la vista.
  ionViewWillLeave() {
    console.log(
      'Tab3Page: ionViewWillLeave - La página va a dejar de ser visible'
    );
  }

  // Este se llama cada vez que la página ha salido completamente de la vista.
  ionViewDidLeave() {
    console.log(
      'Tab3Page: ionViewDidLeave - La página ha dejado de ser visible'
    );
  }
  // --- FIN MÉTODOS DE CICLO DE VIDA DE IONIC ---

  getAllRoute() {
    console.log(
      '....................................................................1111'
    );

    this.routeService.getAllroute().subscribe({
      next: (response: any) => {
        console.log(response, 'respo ,,,,,,,,,,,,,,,,,,,,,,');
        this.school_routes = response.data.school_routes;
      },
      error: (err: any) => {
        // this.mostrarAnimacion = false;
        const errorMessage =
          err?.error?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Error desconocido';

        this.toastService.presentToast(errorMessage);
      },
    });
  }

   handleOpenRouteModal(action: any, route: any) {
    if (!route.id) {
      console.log('error id route');

    }

    const url = `/route/${route.id}`;
    this.router.navigate(
      [url],
      {
        queryParams: {
          action
        }
      }
    );
  }
}
