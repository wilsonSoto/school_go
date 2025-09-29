import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { LocationService } from 'src/app/services/geolocation.service';
import { StudentsService } from 'src/app/services/students.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/login.service';

const LS_PREFIX = 'studentsWithoutLocation';

@Component({
  standalone: false,
  selector: 'app-ubication-modal',
  templateUrl: './ubication-modal.component.html',
  styleUrls: ['./ubication-modal.component.scss'],
})
export class UbicationModalComponent implements OnInit {
  @Input() students: any[] = [];

  isLoading = true;
  isSaving = false;
  userData: any = '';

  studentsWithoutLocation: any[] = [];
  sendUpdateStudentLocation: Array<{id:number;home_latitude:number;home_longitude:number}> = [];

  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService,
    private toastService: ToastService,
    private studentsService: StudentsService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  /** Deshabilita Guardar si hay alguno sin coords válidas o no hay elementos */
  get allStudentsLoactionActive() {
    if (!this.studentsWithoutLocation?.length) return true;
    const hasCoord = (v:any) => v !== null && v !== undefined && v !== '' && Number(v) !== 0;
    const allHave = this.studentsWithoutLocation.every((s:any) =>
      hasCoord(s?.home_latitude) && hasCoord(s?.home_longitude)
    );
    return !allHave;
  }

  async ngOnInit() {
    this.userData = await JSON.parse(localStorage.getItem('userData') || 'null')
      ?.userInfo;

    await this.loadStudents();
  }

  
  async ionViewWillEnter() {
    setTimeout(() => this.loadStudents(), 0);
  }
  /** Carga/recarga datos desde storage (ideal: reemplazar por llamada API) */
  private async loadStudents() {
    this.isLoading = true;
    this.sendUpdateStudentLocation = [];

    const uid = this.userData.id; // ej. 1789 del userData
    try {
      this.studentsWithoutLocation =await JSON.parse(localStorage.getItem(LS_PREFIX) ?? '[]');
    } catch {
      this.studentsWithoutLocation = [];
    }
    this.isLoading = false;
  }

  /** Botón Refrescar */
  manualRefresh() {
    this.loadStudents();
    this.toastService.presentToast('Lista actualizada.',1);
  }

  /** Pull-to-refresh */
  handleRefresh(event: RefresherCustomEvent) {
    this.loadStudents();
    setTimeout(() => event.target.complete(), 200);
  }

  /** Asignar coordenadas actuales a un estudiante */
  async assignLocation(student: any) {
    this.isLoading = true;
    try {
      const location = await this.locationService.getCurrentLocation();
      if (!location?.latitude || !location?.longitude) {
        await this.presentError('No se pudo obtener la ubicación. Intenta nuevamente.');
        return;
      }

      // Actualiza en memoria
      student.home_latitude = location.latitude;
      student.home_longitude = location.longitude;

      // Acumula para enviar luego (solo lo necesario)
      this.sendUpdateStudentLocation.push({
        id: student.id,
        home_latitude: location.latitude,
        home_longitude: location.longitude,
      });

      // Quita de la lista visible
      this.studentsWithoutLocation = this.studentsWithoutLocation.filter((s:any) => s.id !== student.id);

      // Sincroniza storage del usuario actual
      const uid = this.userData.id
      localStorage.setItem(LS_PREFIX, JSON.stringify(this.studentsWithoutLocation));

    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      await this.presentError('No se pudo obtener la ubicación. Intenta nuevamente.');
    } finally {
      this.isLoading = false;
    }
  }

  private async presentError(message: string) {
    const alert = await this.alertController.create({ header: 'Error', message, buttons: ['OK'] });
    await alert.present();
  }

  /** Cerrar modal y cerrar sesión (limpia storage por usuario) */
  async closeModal() {
    const uid = this.userData.id;
    localStorage.removeItem(LS_PREFIX);

    this.studentsWithoutLocation = [];
    this.sendUpdateStudentLocation = [];

    await this.logoutAndGoToSignIn();
    this.modalCtrl.dismiss(this.students);
  }

  private async logoutAndGoToSignIn() {
    await this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  /** Guardar batch en servidor */
  async updateStudentLocation() {
    if (!this.sendUpdateStudentLocation.length) return;

    this.isSaving = true;

    this.studentsService.updateStudentLocation(this.sendUpdateStudentLocation).subscribe({
      next: (_response: any) => {
        this.isSaving = false;
        this.toastService.presentToast('Ubicaciones guardadas correctamente.', 'success');

        // Limpia storage del usuario actual (ya no hay pendientes)
        const uid = this.userData.id;
        localStorage.removeItem(LS_PREFIX);

        // Recarga (debería quedar vacío) y navega
        this.loadStudents();
        this.router.navigateByUrl('/tabs/route', { replaceUrl: true });
      },
      error: (err: any) => {
        this.isSaving = false;
        const errorMessage =
          err?.error?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Error desconocido';
        this.toastService.presentToast(errorMessage);
      },
    });
  }
}
