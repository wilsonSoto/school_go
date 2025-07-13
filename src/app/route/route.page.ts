import { filter } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RouteService } from '../services/route.service';
import { ToastService } from '../services/toast.service';


@Component({
  standalone: false,
  selector: 'app-route-page',
  templateUrl: 'route.page.html',
  styleUrls: ['route.page.scss']
})
export class RoutePage {

  constructor(
    private translate: TranslateService,
    private router: Router,
    private routeService: RouteService,
    private toastService: ToastService,

    private modalController: ModalController
  ) {}
typeSelect: any = 'first';
school_routes_pickup: any = []
school_routes_delivery: any = []

  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }

  ionViewWillEnter() {
    console.log('Tab3Page: ionViewWillEnter - La página va a ser visible');
    this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
  }


  getAllRoute() {
    console.log(
      '....................................................................1111'
    );

    this.routeService.getAllroute().subscribe({
      next: (response: any) => {
        console.log(response, 'respo ,,,,,,,,,,,,,,,,,,,,,,');
        this.school_routes_pickup = response.data.school_routes.filter((route: any) => route.route_type == 'Recogida');
        this.school_routes_delivery = response.data.school_routes.filter((route: any) => route.route_type !== 'Recogida');
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

    const url = `/planned-route/${route.id}`;
    this.router.navigate(
      [url],
      {
        queryParams: {
          action
        }
      }
    );
  }

  // async handleOpenDriverModal(action: any) {
  //   try {
  //     const modal = await this.modalController.create({
  //       component: AddDriversComponent,
  //       componentProps: {
  //         action: action,
  //       },
  //       initialBreakpoint: 1,
  //       breakpoints: [0, 1],
  //       cssClass: ['loading-truck-options-sheet-modal'],
  //     });
  //     await modal.present();

  //     const { data } = await modal.onWillDismiss();
  //     const { selectedOption, exception } = data;

  //     if (data.action === 'cancel') {
  //       return;
  //     }
  //   } catch (error: any) {}
  // }
}
