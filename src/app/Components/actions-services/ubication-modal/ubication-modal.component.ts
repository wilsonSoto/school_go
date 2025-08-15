import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LocationService } from 'src/app/services/geolocation.service';
import { StudentsService } from 'src/app/services/students.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-ubication-modal',
  templateUrl: './ubication-modal.component.html',
  styleUrls: ['./ubication-modal.component.scss'],
})
export class UbicationModalComponent implements OnInit {
  @Input() students: any[] = [];

  studentsWithoutLocation: any[] = [];
isSaving: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService,
    private toastService: ToastService,
    private studentsService: StudentsService,
    private router: Router,
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
  }

  async assignLocation(student: any) {
    try {
      const location = await this.locationService.getCurrentLocation();

      if (!location || !location.latitude || !location.longitude) {
        throw new Error('No se pudo obtener la ubicación');
      }

      student.home_latitude = location.latitude;
      student.home_longitude = location.longitude;

      // Eliminar de la lista temporal
      this.studentsWithoutLocation = this.studentsWithoutLocation.filter(
        (s) => s.id !== student.id
      );

    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo obtener la ubicación. Intenta nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  closeModal() {
    this.modalCtrl.dismiss(this.students);
  }

   async updateStudentLocation() {

  this.isSaving = true;
    this.router.navigateByUrl('/tabs/route', { replaceUrl: true });

      // return
      this.studentsService.updateStudentLocation(this.studentsWithoutLocation).subscribe({
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
