import { filter } from 'rxjs';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RouteService } from '../services/route.service';
import { ToastService } from '../services/toast.service';
import { UbicationModalComponent } from '../Components/actions-services/ubication-modal/ubication-modal.component';

@Component({
  standalone: false,
  selector: 'app-route-page',
  templateUrl: 'route.page.html',
  styleUrls: ['route.page.scss'],
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
  userData: any = '';
  students: any = [];
  school_routes_pickup: any = [];
  school_routes_delivery: any = [];

  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }

  async ionViewWillEnter() {
    this.userData = await JSON.parse(localStorage.getItem('userData') || 'null')
      ?.userInfo;
    console.log(this.userData, ';;;;;;;;;;;;;;;;55555');

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
        this.school_routes_pickup = response.data.school_routes.filter(
          (route: any) => route.route_type == 'Recogida'
        );
        this.school_routes_delivery = response.data.school_routes.filter(
          (route: any) => route.route_type !== 'Recogida'
        );
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
    this.router.navigate([url], {
      queryParams: {
        action,
      },
    });
  }
  async openModalUbicacion() {
    console.log('Ubicación recibida desde modal+++++++++++++++++++:');
    const studentsWithoutLocation = this.students.map((student: any) => {
      return {
        ...student,
        home_latitude: 0,
        home_longitude: 0,
      };
    });
    const modal = await this.modalController.create({
      component: UbicationModalComponent,
      componentProps: {
        students: studentsWithoutLocation, // pasa tu lista aquí
        // students: this.students // pasa tu lista aquí
      },

      // component: UbicacionModalComponent,
      cssClass: 'full-screen-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false, // ❌ No se puede cerrar tocando afuera
      canDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('Ubicación recibida desde modal:', data);
      // Aquí puedes guardar la ubicación o usarla en el mapa
    }
  }
}
