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

@Component({
  standalone: false,
  selector: 'app-add-client',
  templateUrl: 'add-client.component.html',
  styleUrls: ['add-client.component.scss'],
})
export class AddClientComponent {
  constructor(
    private translate: TranslateService,
    private modalController: ModalController,
    private parentService: ParentService,

    private fb: FormBuilder,
    private toastService: ToastService
  ) {}
  // parentImage: any = null;
  @Input() action: string = '';
  // @Input() students: any = [];
  @Input() partner_id: any = null;
  @Input() modal!: Components.IonModal;

  showCalendar = false;

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
    } else {
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
      national_id: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // Requerido y 11 dígitos (ejemplo para Dominicana)
      address: ['', Validators.required],
      parentImage: [''],
      nationalIdImage: [''],
      responsibleGuardianImage: [''],
      location_latitude: ['0', Validators.required],
      location_longitude: ['0', Validators.required],
    });

    // Opcional: Si el `action` es 'edit' y tienes datos existentes, puedes cargarlos
    if (this.action === 'edit') {
      console.log(this.parent, '[[[[[[[[[[[[[[[[[[[[[[[[[[[[');

      this.parentForm.patchValue(this.parent);
      this.parentImage = this.parent.parentImage;
      this.responsibleGuardianImage = this.parent.responsibleGuardianImage;
      this.nationalIdImage = this.parent.nationalIdImage;

      // Por ejemplo, si tuvieras un @Input() parentData: any;
      // this.parentForm.patchValue(this.parentData);
    }
  }

  getParent() {
    this.parentService.getParent(this.partner_id).subscribe({
      next: (response: any) => {
        console.log(response, 'respo ,,,,,,,,,,,,,,,,,,,,,,');
        response.data.parent.number_students = response.data.students?.length;
        this.parent = response.data.parent;
        this.students = response.data.students;
        this.initForm(); // Inicializamos el formulario cuando el componente se carga

        // this.toastService.presentToast('Bienvenido!','custom-success-toast')
        // this.router.navigate(['tabs'])

        // this.mostrarAnimacion = false;
      },
      error: (err: any) => {
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
  convertDateToTimestamp(): number | null {
    const dateObject = new Date();
    if (isNaN(dateObject.getTime())) {
      return null;
    }

    return dateObject.getTime(); // Devuelve el timestamp en milisegundos
  }

  async onSubmit() {
    // this.handleImageCapture()

    this.parentForm.markAllAsTouched(); // Asegura que los errores se muestren en el HTML

    console.log('Estado completo del formulario:', this.parentForm);
    console.log('Errores del formulario (si existen):', this.parentForm.errors); // Esto suele ser null a nivel de FormGroup
    console.log('¿Formulario Válido?', this.parentForm.valid);

    if (this.parentForm.valid) {
      // if (this.action == 'add') {

      // this.parentService.postParent(this.parentForm.value).subscribe({
      //   next: (response: any) => {
      //     console.log(response, 'respo ,,,,,,,,,,,,,,,,,,,,,,');
      //     console.log(response.data, 'esponse.data ,,,,,,,,,,,,,,,,,,,,,,');
      //     // response.data.parent.number_students = response.data.students?.length
      //     // this.clients = [response.data.parent]
      //     // this.students = [response.data.students]
      //     this.toastService.presentToast('Datos registrados', 'custom-success-toast');
      //     // this.router.navigate(['tabs'])
      //     this.partner_id = response.data.partner_id
      //     this.parentForm.patchValue(response.data);

      //     // this.mostrarAnimacion = false;
      //   },
      //   error: (err: any) => {
      //     // this.mostrarAnimacion = false;
      //     const errorMessage =
      //       err.error.error.message ||
      //       err.error.error ||
      //       err?.message ||
      //       'Error desconocido';

      //     this.toastService.presentToast(errorMessage);
      //   },
      // });
      const userData = JSON.parse(localStorage.getItem('userData') ?? '{}');

      const data = {
        form: this.parentForm.value,
        partner_id: this.partner_id,
        company_id: userData.company.id ?? null,
        action: this.action,
      };

      const observableResponse = await this.parentService.postParent(data);

      observableResponse.subscribe({
        next: (response: any) => {
          const msm =
            this.action == 'edit'
              ? 'Estudiante Editado'
              : 'Estudiante Agregado';
          this.toastService.presentToast(msm, 'custom-success-toast');
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
    // this.store.dispatch(
    //   UiActions.updateLoadFilterDate({
    //     date: date,
    //   })
    // );

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

  //  async handleOpenMapsModal() {
  //     try {
  //       const modal = await this.modalController.create({
  //         component: MapsComponent,
  //         componentProps: {
  //         },
  //         initialBreakpoint: 1,
  //         breakpoints: [0, 1],
  //         cssClass: ['loading-truck-options-sheet-modal'],
  //       });
  //       await modal.present();

  //       const { data } = await modal.onWillDismiss();
  //       const { selectedOption, exception } = data;

  //       if (data.action === 'cancel') {
  //         return;
  //       }
  //     } catch (error: any) {}
  //   }
}
