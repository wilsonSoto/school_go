import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController,RefresherCustomEvent } from '@ionic/angular';
import { LocationService } from 'src/app/services/geolocation.service';
import { StudentsService } from 'src/app/services/students.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/login.service';

@Component({
  standalone: false,
  selector: 'app-ubication-modal',
  templateUrl: './ubication-modal.component.html',
  styleUrls: ['./ubication-modal.component.scss'],
})
export class UbicationModalComponent implements OnInit {
  @Input() students: any[] = [];
  isLoading: boolean = true;
  
  studentsWithoutLocation: any[] = [];
isSaving: boolean = false;
sendUpdateStudentLocation: any = []
  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService,
    private toastService: ToastService,
    private studentsService: StudentsService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}


get allStudentsLoactionActive () {
    const data= this.studentsWithoutLocation.every(
      (student: any) =>
       ( student.home_latitude &&
        student.home_longitude) ||
        ( student.home_latitude !== 0 &&
        student.home_longitude !== 0)
    );
    return !data;
}

  ngOnInit(): void {
    this.studentsWithoutLocation =  JSON.parse(localStorage.getItem('studentsWithoutLocation') ?? '[]')
     this.isLoading = false;

  }

    handleRefresh(event: RefresherCustomEvent) {
    this.studentsWithoutLocation = []

    this.studentsWithoutLocation =  JSON.parse(localStorage.getItem('studentsWithoutLocation') ?? '[]')
      setTimeout(() => {
        // Any calls to load data go here
        event.target.complete();
      }, 2000);
    }

  async assignLocation(student: any) {
    this.isLoading = true;

    try {
      const location = await this.locationService.getCurrentLocation();

      if (!location || !location.latitude || !location.longitude) {
    this.isLoading = false;
        return
        throw new Error('No se pudo obtener la ubicación');
      }

      student.home_latitude = location.latitude;
      student.home_longitude = location.longitude;

      // Eliminar de la lista temporal
      this.sendUpdateStudentLocation.push(student)
      this.studentsWithoutLocation = this.studentsWithoutLocation.filter(
        (s) => s.id !== student.id
      );
    this.isLoading = false;

    } catch (error) {
    this.isLoading = false;

      console.error('Error al obtener ubicación:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo obtener la ubicación. Intenta nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async closeModal() {
    this.studentsWithoutLocation = [...this.studentsWithoutLocation, ...this.sendUpdateStudentLocation]
    await this.logoutAndGoToSignIn()
    this.modalCtrl.dismiss(this.students);
  }
   async logoutAndGoToSignIn() {
    await this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

   async updateStudentLocation() {

  this.isSaving = true;
    this.router.navigateByUrl('/tabs/route', { replaceUrl: true });
    const data = this.sendUpdateStudentLocation.map((st: any) => {
      return {
        id: st.id,
        home_latitude: st.home_latitude,
        home_longitude: st.home_longitude,
      };
    });

      // return
      this.studentsService.updateStudentLocation(data).subscribe({
        next: (response: any) => {

          this.isSaving = false;
          this.toastService.presentToast('Ubicaciones guardadas correctamente.', 'success');
    this.router.navigateByUrl('/tabs/route', { replaceUrl: true });

        console.log(response, 'respo ,,,,,,,,,,,,,getParentgetParent,,,,,,,,,');
      },
      error: (err: any) => {

      this.isSaving = false;
        // this.mostrarAnimacion = false;
        const errorMessage =
          err.error.error.message ||
          err.error.error ||
          err?.message ||
          'Error desconocido';

        this.toastService.presentToast(errorMessage);
      },
    });
  }

}
