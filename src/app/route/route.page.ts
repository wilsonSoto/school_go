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
import { ModalController, RefresherCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RouteService } from '../services/route.service';
import { ToastService } from '../services/toast.service';
import { UbicationModalComponent } from '../Components/actions-services/ubication-modal/ubication-modal.component';
import { AuthService } from '../services/login.service';
import { ParentService } from '../services/parents.service';

@Component({
  standalone: false,
  selector: 'app-route-page',
  templateUrl: 'route.page.html',
  styleUrls: ['route.page.scss'],
})
export class RoutePage implements OnInit {
  constructor(
    private translate: TranslateService,
    private router: Router,
    private routeService: RouteService,
    private toastService: ToastService,
    private authService: AuthService,
    private parentService: ParentService,
    private modalController: ModalController
  ) {}
  typeSelect: any = 'first';
  hasData: boolean = true; // ✅ Para saber si hay datos en el segmento activo

  userData: any = '';
  students: any = [];
  school_routes_pickup: any = [];
  school_routes_delivery: any = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';

  filtered_pickup: any[] = [];
  filtered_delivery: any[] = [];

  async logoutAndGoToSignIn() {
    await this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }
  ngOnInit(): void {
      const currentRoute = this.router.url;

    if (this.userData?.partner_id && currentRoute !== '/sign-in' && currentRoute !== '/') {
      this.getParent();
    }

  }

  async ionViewWillEnter() {
    this.userData = await JSON.parse(localStorage.getItem('userData') || 'null')
      ?.userInfo;

      const currentRoute = this.router.url;

    if (this.userData?.partner_id && currentRoute !== '/sign-in' && currentRoute !== '/') {
      this.getParent();
    }

      this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
  }

  handleSegmentChange(event: any) {
    const selected = event.detail.value;
    this.typeSelect = selected;

    // Limpiar los datos al cambiar de segmento
    if (selected === 'first') {
      this.hasData = this.school_routes_pickup.length > 0;
    } else {
      this.hasData = this.school_routes_delivery.length > 0;
    }
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.getAllRoute(); // Llama a tu función para cargar las rutas aquí
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  filterRoutes(event: any) {
    const query = (event.target.value || '').toLowerCase();
    this.searchTerm = query;

    if (!query) {
      // 🔹 Si el buscador está vacío, restauramos las listas originales
      this.filtered_pickup = [...this.school_routes_pickup];
      this.filtered_delivery = [...this.school_routes_delivery];
      this.hasData =
        this.typeSelect === 'first'
          ? this.filtered_pickup.length > 0
          : this.filtered_delivery.length > 0;
      return;
    }

    // 🔹 Filtro por nombre de ruta, chofer o estudiante
    const filterFunction = (route: any) => {
      const routeName = route.name?.toLowerCase() || '';
      const driverName = route.school_driver?.name?.toLowerCase() || '';
      const studentNames = (route.students || [])
        .map((s: any) => s.name?.toLowerCase() || '')
        .join(' ');

      return (
        routeName.includes(query) ||
        driverName.includes(query) ||
        studentNames.includes(query)
      );
    };

    this.filtered_pickup = this.school_routes_pickup.filter(filterFunction);
    this.filtered_delivery = this.school_routes_delivery.filter(filterFunction);

    // 🔹 Validamos si hay datos para mostrar el mensaje de "No hay información"
    this.hasData =
      this.typeSelect === 'first'
        ? this.filtered_pickup.length > 0
        : this.filtered_delivery.length > 0;
  }

  getAllRoute() {
    this.isLoading = true;
    this.errorMessage = null;

    this.routeService.getAllroute().subscribe({
      next: (response: any) => {
        this.isLoading = false;

        this.school_routes_pickup = response.data.school_routes.filter(
          (route: any) => route.route_type === 'Recogida'
        );
        this.school_routes_delivery = response.data.school_routes.filter(
          (route: any) => route.route_type !== 'Recogida'
        );
        this.filtered_pickup = [...this.school_routes_pickup];
        this.filtered_delivery = [...this.school_routes_delivery];

        // ✅ Actualizar si hay datos en el segmento actual
        if (this.typeSelect === 'first') {
          this.hasData = this.school_routes_pickup.length > 0;
        } else {
          this.hasData = this.school_routes_delivery.length > 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;

        const errorMessage =
        err?.error?.error?.message ||
        err?.error?.error ||
        err?.message ||
        'Error desconocido';
        this.errorMessage =
          'Error al cargar las rutas: ' + (errorMessage || 'Error desconocido');

        this.toastService.presentToast(this.errorMessage);
      },
    });
  }

    getParent() {
    this.parentService.getParent(this.userData?.partner_id).subscribe({
      next: (response: any) => {
        const studentsWithoutLocation = response.data.students.filter(
          (student: any) =>
            !student.home_latitude ||
            !student.home_longitude ||
            student.home_latitude === 0 ||
            student.home_longitude === 0
        );
        if (studentsWithoutLocation && studentsWithoutLocation.length > 0) {
          localStorage.setItem('studentsWithoutLocation', JSON.stringify(studentsWithoutLocation));
          this.router.navigateByUrl('/pending-location', { replaceUrl: true });
        }
      },
      error: (err: any) => {
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
}
