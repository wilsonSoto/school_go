import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importa estos
import { Bus } from 'src/app/interfaces/bus.interface';
import { Components } from '@ionic/core';


@Component({
  standalone: false,
  selector: 'app-add-vehicles',
  templateUrl: 'add-vehicles.component.html',
  styleUrls: ['add-vehicles.component.scss']
})
export class AddVehiclesComponent implements OnInit{
   constructor(
      private translate: TranslateService,
      private fb: FormBuilder,

    ) {

    }
  @Input() modal!: Components.IonModal;

  @Input() action: string = '';
  @Input() bus!: Bus;
  busForm!: FormGroup;
  vehicule_image: string | null = null;
  license_plate_image: string | null = null;


  get defaultHref(): string {
    let href = '/tabs';

    return href;
  }

  async ngOnInit() {
    this.initForm();

  }

   initForm(): void {
    this.busForm = this.fb.group({
      name: ['', Validators.required], // Campo requerido
      amenities: ['', Validators.required],
      // phone: ['', Validators.pattern(/^\d{10}$/)],
      brand: ['', Validators.required],
      active: [true],
      model: ['', Validators.required],
      people_capacity: ['', Validators.required],
      school_driver: ['', Validators.required],
      vehicle_color: ['', Validators.required],
      vehicule_image: [''],
      license_plate_image: [''],
    });
     if (this.action === 'edit') {
      // console.log(this.parent, '[[[[[[[[[[[[[[[[[[[[[[[[[[[[');

      this.busForm.patchValue(this.bus);
      this.vehicule_image = this.bus.vehicule_image;
      this.license_plate_image = this.bus.license_plate_image;
      // this.nationalIdImage = this.bus.nationalIdImage;

      // Por ejemplo, si tuvieras un @Input() parentData: any;
      // this.busForm.patchValue(this.parentData);
    }
  }


  async onSubmit() {
    this.busForm.markAllAsTouched();
    if (!this.busForm.value.vehicule_image) {
      return;
    }

    if (this.busForm.valid) {
      // this.modal.dismiss({
      //   action: this.action,
      //   busForm: this.busForm.value,
      // });

      // if (this.partner_id) {
      //   const data = {
      //     form: this.busForm.value,
      //     partner_id: this.partner_id,
      //     studen_id: this.student.id ?? null,
      //     action: this.action,
      //   };

      //   const observableResponse = await this.studentService.postStudent(data);

      //   observableResponse.subscribe({
      //     next: (response: any) => {
      //       const msm = this.student.id
      //         ? 'Estudiante Editado'
      //         : 'Estudiante Agregado';
      //       this.toastService.presentToast(msm, 'custom-success-toast');
      //     },
      //     error: (err: any) => {
      //       const errorMessage =
      //         err.error.error.message ||
      //         err.error.error ||
      //         err?.message ||
      //         'Error desconocido al agregar estudiante';
      //       this.toastService.presentToast(errorMessage);
      //     },
      //   });
      // }
    } else {
      console.log('Formulario inválido. Errores por campo:');
      Object.keys(this.busForm.controls).forEach((key) => {
        const control = this.busForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
        }
      });
    }
  }

   removeImage(cont: any) {
    if (cont == 1) {
      // this.busForm.
      this.vehicule_image = '';
      this.busForm.get('vehicule_image')?.setValue(this.vehicule_image);
    }
    if (cont == 2) {
      this.license_plate_image = '';
      this.busForm.get('license_plate_image')?.setValue(this.license_plate_image);
    }
    // if (cont == 3) {
    //   this.responsibleGuardianImage = '';
    //   this.busForm
    //     .get('responsibleGuardianImage')
    //     ?.setValue(this.responsibleGuardianImage);
    // }
  }

  handleImageCapture(event: any, cont: number): void {
    if (cont == 1) {
      // this.busForm.
      this.vehicule_image = event;
      this.busForm.get('vehicule_image')?.setValue(this.vehicule_image);
    }
    if (cont == 2) {
      this.license_plate_image = event;
      this.busForm.get('license_plate_image')?.setValue(this.license_plate_image);
    }
    // if (cont == 3) {
    //   this.responsibleGuardianImage = event;
    //   this.busForm
    //     .get('responsibleGuardianImage')
    //     ?.setValue(this.responsibleGuardianImage);
    // }
  }
    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }
}
