import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importa estos
import { Components } from '@ionic/core';
import { ToastService } from 'src/app/services/toast.service';
import { StudentsService } from 'src/app/services/students.service';
import { Subscription, fromEvent, merge, of } from 'rxjs';

import { LocationService } from 'src/app/services/geolocation.service';
import { convertDateToTimestamp } from 'src/app/shared/utils/convertDateToTimestamp';

@Component({
  standalone: false,
  selector: 'app-add-students',
  templateUrl: 'add-students.component.html',
  styleUrls: ['add-students.component.scss'],
})
export class AddStudentsComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private studentService: StudentsService,
    private locationService: LocationService
  ) {}

  currentLatitude: number | null = null;
  currentLongitude: number | null = null;

  // Para el observador de ubicación (si lo usas)
  private watchId: string | null = null;
  private positionSubscription: Subscription | undefined;

  @Input() modal!: Components.IonModal;

  @Input() action: string = '';
  @Input() partner_id: string | null = null;
  @Input() student: any = [];
  showCalendar = false;

  colorCalendar = 'dark';
  location: any | null = null;
  date = new Date();

  get defaultHref(): string {
    let href = '/tabs';

    return href;
  }

  profile: string | null = null;
  responsibleGuardianImage: string | null = null;
  studentForm!: FormGroup;

  async ngOnInit() {
    this.initForm();
    const local = await this.locationService.getCurrentLocation();
    if (!local) {
      this.location = { latitude: 0, longitude: 0 };
    } else {
      this.location = local;
    }
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      name: ['', Validators.required], // Campo requerido
      birth_date: ['', Validators.required],
      birth_date_timestamp: ['', Validators.required],
      phone: ['', Validators.pattern(/^\d{10}$/)],
      allergies_or_illness: ['', Validators.required],
      active: [true],
      sex: ['', Validators.required],
      full_address: ['', Validators.required],
      home_latitude: ['', Validators.required],
      home_longitude: ['', Validators.required],
      profile: [''],
      father_name: [''],
      mother_name: [''],
    });
    if (this.action === 'edit') {
      console.log(this.student,'[[[][[][][[][[][]');

      this.studentForm.patchValue(this.student);
      const date = moment(this.student.birth_date_timestamp).format(
        'YYYY-MM-DD'
      );

      this.studentForm.patchValue({
        birth_date: date,
        profile: this.student?.image,
      });
      this.profile = this.student?.image;
    }
  }

  async updateBirthDate() {
    let timestamp: any = await convertDateToTimestamp(
      this.studentForm.value.birth_date
    );
    if (timestamp !== null) {
      this.studentForm.patchValue({
        birth_date_timestamp: timestamp,
      });
      const newDate = new Date(timestamp);
      console.log(
        `El timestamp ${timestamp} representa la fecha y hora: ${newDate} `
      );
    } else {
      timestamp = new Date();
    }
  }

  async onSubmit() {
    this.studentForm.markAllAsTouched();
    if (!this.studentForm.value.profile) {
      return;
    }

    if (this.studentForm.valid) {
      // this.modal.dismiss({
      //   action: this.action,
      //   studentForm: this.studentForm.value,
      // });

      if (this.partner_id) {
        const data = {
          form: this.studentForm.value,
          partner_id: this.partner_id,
          studen_id: this.student.id ?? null,
          action: this.action,
        };

        const observableResponse = await this.studentService.postStudent(data);

        observableResponse.subscribe({
          next: (response: any) => {
            const msm = this.student.id
              ? 'Estudiante Editado'
              : 'Estudiante Agregado';
            this.toastService.presentToast(msm, 'custom-success-toast');
            this.modal.dismiss({
              action: this.action,
              studentForm: this.studentForm.value,
            });

          },
          error: (err: any) => {
            const errorMessage =
              err.error.error.message ||
              err.error.error ||
              err?.message ||
              'Error desconocido al agregar estudiante';
            this.toastService.presentToast(errorMessage);
          },
        });
      }
    } else {
      console.log('Formulario inválido. Errores por campo:');
      Object.keys(this.studentForm.controls).forEach((key) => {
        const control = this.studentForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
        }
      });
    }
  }


  removeImage() {
    this.profile = '';
    this.studentForm.get('parentImage')?.setValue(this.profile);

  }

  handleImageCapture(event: any): void {
    this.profile = event;
    if (this.profile) {
      this.studentForm.get('profile')?.setValue(this.profile);
    }
    if (this.action !== 'edit') {
      this.studentForm.patchValue({
        home_latitude: this.location.latitude,
        home_longitude: this.location.longitude,
      });
    }
  }
  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }

}
