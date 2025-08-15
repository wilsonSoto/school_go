import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CameraComponent } from '../actions-services/camera/camera.component';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importa estos
import { AddStudentsComponent } from '../add-students/add-students.component';
import { ParentService } from 'src/app/services/parents.service';
import { ToastService } from 'src/app/services/toast.service';
import { StudentsService } from 'src/app/services/students.service';
// import { MapsComponent } from '../actions-services/maps/maps.component';
import { Components } from '@ionic/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-add-parent',
  templateUrl: 'add-parent.component.html',
  styleUrls: ['add-parent.component.scss'],
})
export class AddParentComponent {
  constructor(
    private translate: TranslateService,
    private modalController: ModalController,
    private parentService: ParentService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}
  // parentImage: any = null;
  @Input() action: string = '';
  // @Input() students: any = [];
  @Input() partner_id: any = null;
  @Input() modal!: Components.IonModal;

  showCalendar = false;
  isLoading: boolean = false;

  colorCalendar = 'dark';
  date = new Date();

  get defaultHref(): string {
    let href = '/tabs';

    return href;
  }

  // **NUEVO: Propiedad para la imagen capturada**
  parentImage: string | null = null; // Para almacenar la URL de la imagen capturada
  nationalIdImage: string | null = null; // Para almacenar la URL de la imagen capturada
  responsibleGuardianImage: string | null = null; // Para almacenar la URL de la imagen capturada
  // panrent: any | null = []; // Para almacenar la URL de la imagen capturada
  allStudents: any = [];
  parent: any = [];
  students: any = [];
  // **NUEVO: Propiedad para el formulario reactivo**
  parentForm!: FormGroup;

  // Inyectamos FormBuilder en el constructor

  ngOnInit() {
    console.log(this.partner_id, ';partner_id');
    this.initForm(); // Inicializamos el formulario cuando el componente se carga

    if (this.partner_id) {
      this.getParent();
    }
  }

  // **NUEVO: Método para inicializar el formulario**
  initForm(): void {
    let timestamp: any = this.convertDateToTimestamp();
    if (timestamp !== null) {
      const newDate = new Date(timestamp);
      console.log(
        `El timestamp ${timestamp} representa la fecha y hora: ${newDate.toISOString()}`
      );
    } else {
      timestamp = new Date();
    }

    this.parentForm = this.fb.group({
      name: ['', Validators.required], // Campo requerido
      responsibleGuardian: ['', Validators.required], // Campo requerido
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Requerido y 10 dígitos (ejemplo)
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Requerido y 10 dígitos (ejemplo)
      email: ['', [Validators.required, Validators.email]], // Requerido y formato de email
      vat: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // Requerido y 11 dígitos (ejemplo para Dominicana)
      contact_address: ['', Validators.required],
      parentImage: [''],
      nationalIdImage: [''],
      responsibleGuardianImage: [''],
      location_latitude: ['0', Validators.required],
      location_longitude: ['0', Validators.required],
    });

    // Opcional: Si el `action` es 'edit' y tienes datos existentes, puedes cargarlos
    if (this.action === 'edit') {
      this.parentForm.patchValue(this.parent);
      this.parentImage = this.parent.parentImage;
      this.responsibleGuardianImage = this.parent.responsibleGuardianImage;
      this.nationalIdImage = this.parent.nationalIdImage;
    }
  }

  getParent() {
    this.isLoading = true;

    this.parentService.getParent(this.partner_id).subscribe({
      next: (response: any) => {
        response.data.parent.number_students = response.data.students?.length;
        this.parent = response.data.parent;
        this.students = response.data.students;
        this.initForm(); // Inicializamos el formulario cuando el componente se carga

        this.isLoading = false;

      },
      error: (err: any) => {
        this.isLoading = false;
        const errorMessage =
          err.error.error.message ||
          err.error.error ||
          err?.message ||
          'Error desconocido';

        this.toastService.presentToast(errorMessage);
      },
    });
  }
  convertDateToTimestamp(): number | null {
    const dateObject = new Date();
    if (isNaN(dateObject.getTime())) {
      return null;
    }

    return dateObject.getTime(); // Devuelve el timestamp en milisegundos
  }

  async onSubmit() {
    this.parentForm.markAllAsTouched(); // Asegura que los errores se muestren en el HTML

    if (this.parentForm.valid) {
      const userData = JSON.parse(
        localStorage.getItem('userData') ?? '{}'
      )?.userInfo;

      const data = {
        form: this.parentForm.value,
        partner_id: this.partner_id,
        company_id: userData.partner_company.id ?? null,
        action: this.action,
      };
      this.isLoading = true;

      const observableResponse = await this.parentService.postParent(data);

      observableResponse.subscribe({
        next: (response: any) => {
          const msm =
            this.action == 'edit' ? 'Padre Editado' : 'Padre Agregado';
          this.toastService.presentToast(msm, 'custom-success-toast');
          this.isLoading = false;

          if (this.partner_id) {
            this.modal.dismiss({ action: 'cancel' });

            this.getParent();
          } else {
            this.router.navigate(['/tabs/tab1']);
          }
        },
        error: (err: any) => {
          this.isLoading = false;

          const errorMessage =
            err.error.error.message ||
            err.error.error ||
            err?.message ||
            'Error desconocido al agregar padre';
          this.toastService.presentToast(errorMessage);
        },
      });
      // }
      // ... tu lógica de envío
    } else {
      console.log('Formulario inválido. Errores por campo:');
      Object.keys(this.parentForm.controls).forEach((key) => {
        const control = this.parentForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
        }
      });
    }
  }

  removeImage(cont: any) {
    if (cont == 1) {
      // this.parentForm.
      this.parentImage = '';
      this.parentForm.get('parentImage')?.setValue(this.parentImage);
    }
    if (cont == 2) {
      this.nationalIdImage = '';
      this.parentForm.get('nationalIdImage')?.setValue(this.nationalIdImage);
    }
    if (cont == 3) {
      this.responsibleGuardianImage = '';
      this.parentForm
        .get('responsibleGuardianImage')
        ?.setValue(this.responsibleGuardianImage);
    }
  }

  handleImageCapture(event: any, cont: number): void {
    if (cont == 1) {
      // this.parentForm.
      this.parentImage = event;
      this.parentForm.get('parentImage')?.setValue(this.parentImage);
    }
    if (cont == 2) {
      this.nationalIdImage = event;
      this.parentForm.get('nationalIdImage')?.setValue(this.nationalIdImage);
    }
    if (cont == 3) {
      this.responsibleGuardianImage = event;
      this.parentForm
        .get('responsibleGuardianImage')
        ?.setValue(this.responsibleGuardianImage);
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
  onDateSelected(event: any) {
    const date = moment(event.target.value).format('YYYY-MM-DDTHH:mm:ss');
   
    this.modalController.dismiss(); // Dismiss the modal
  }

  async handleOpenStudentsModal(
    action: any,
    student: any = [],
    index: number = -1
  ) {
    try {
      const modal = await this.modalController.create({
        component: AddStudentsComponent,
        componentProps: {
          action: action,
          // parentForm: this.parentForm.value,
          student: student,
          partner_id: this.partner_id,
        },
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        cssClass: ['loading-truck-options-sheet-modal'],
      });
      await modal.present();

      const { data } = await modal.onWillDismiss();
      const { studentsForm } = data;

      if (data.action === 'cancel') {
        return;
      }

      if (data.action === 'add') {
        this.allStudents.push(studentsForm);
        return;
      }

      if (data.action === 'edit') {
        if (index !== -1) {
          // -1 significa que no se encontró el elemento
          this.allStudents.splice(index, 1); // Elimina 1 elemento desde ese índice
          this.allStudents.push(studentsForm);
        }
        return;
      }
    } catch (error: any) {}
  }
}
