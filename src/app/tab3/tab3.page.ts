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
import { ModalController, RefresherCustomEvent } from '@ionic/angular';
import { UbicationModalComponent } from '../Components/actions-services/ubication-modal/ubication-modal.component';
import { StorageService } from '../services/storage.service';
import { hostUrlEnum } from 'src/types';
import { AuthService } from '../services/login.service';
// import { IonViewWillLeave } from '@ionic/angular';

@Component({
  // <--- ESTE DECORADOR ES PROBABLEMENTE EL QUE FALTA O ESTÁ MAL ESCRITO
  standalone: false,
  selector: 'app-tab3', // O el selector que tengas definido para tu página
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  school_routes: any = [];
  token = '';
  constructor(
    private routeService: RouteService,
    private toastService: ToastService,
    private router: Router,
    private modalController: ModalController,
    private storage: StorageService,
    private authService: AuthService,

  ) {}
  searchTerm: string = '';
  filteredRoutes: any[] = [];
  hasData: boolean = true;
  
  isLoading: boolean = true;
  errorMessage: string | null = null;
  ngOnInit(): void {
    const self = this;
    // this.getAllRoute();
    this.storage.get(hostUrlEnum.FCM_TOKEN).then((resp) => {
      self.token = JSON.stringify(resp);
    });
  }


  async logoutAndGoToSignIn() {
    await this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
  
  handleRefresh(event: RefresherCustomEvent) {
    this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
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



  // Este se llama cada vez que la página ha salido completamente de la vista.
  ionViewDidLeave() {
    console.log(
      'Tab3Page: ionViewDidLeave - La página ha dejado de ser visible'
    );
  }
  // --- FIN MÉTODOS DE CICLO DE VIDA DE IONIC ---

  getAllRoute() {
    this.isLoading = true;
    this.errorMessage = null;
    this.routeService.getAllroute().subscribe({
      next: (response: any) => {
        this.isLoading = false;
  
        this.school_routes = response.data.school_routes;
        this.filteredRoutes = [...this.school_routes]; // Inicializamos el filtrado
        this.hasData = this.filteredRoutes.length > 0;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          'Error al cargar las rutas: ' + (err.message || 'Error desconocido');
  
        const errorMessage =
          err?.error?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Error desconocido';
  
        this.toastService.presentToast(errorMessage);
      },
    });
  }
  
  filterRoutes(event: any) {
    const query = (event.target.value || '').toLowerCase();
  
    if (!query) {
      this.filteredRoutes = [...this.school_routes]; // Restaurar listado
    } else {
      this.filteredRoutes = this.school_routes.filter((route: any) => {
        const routeName = route.name?.toLowerCase() || '';
        const driverName = route.school_driver?.name?.toLowerCase() || '';
        const students = route.students
          ?.map((s: any) => s.name?.toLowerCase())
          .join(' ') || '';
  
        return (
          routeName.includes(query) ||
          driverName.includes(query) ||
          students.includes(query)
        );
      });
    }
  
    this.hasData = this.filteredRoutes.length > 0;
  }
  
  getAllRoute2222222() {
    this.isLoading = true;
    this.errorMessage = null;
    this.routeService.getAllroute().subscribe({
      next: (response: any) => {
        this.isLoading = false;

        this.school_routes = response.data.school_routes;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          'Error al cargar las rutas: ' + (err.message || 'Error desconocido');

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
    this.router.navigate([url], {
      queryParams: {
        action,
      },
    });
  }
}
