import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importa estos
import { Driver } from 'src/app/interfaces/driver.interface';
import { Components } from '@ionic/core';


@Component({
  standalone: false,
  selector: 'app-add-driver',
  templateUrl: 'add-drivers.component.html',
  styleUrls: ['add-drivers.component.scss']
})
export class AddDriversComponent implements OnInit{
   constructor(
      private translate: TranslateService,
      private fb: FormBuilder,

    ) {

    }
  @Input() modal!: Components.IonModal;

  @Input() action: string = '';
  @Input() driver!: Driver;
  driverForm!: FormGroup;
  profile: string | null = null;
  driver_license_image: string | null = null;


  get defaultHref(): string {
    let href = '/tabs';

    return href;
  }

  async ngOnInit() {
    this.initForm();

  }

   initForm(): void {
    this.driverForm = this.fb.group({
      name: ['', Validators.required], // Campo requerido
      email: ['', [Validators.required, Validators.email]], // Requerido y formato de email
      address: ['', Validators.required],
      phone: ['', Validators.pattern(/^\d{10}$/)],
      driver_license: ['', Validators.required],
      active: [true],
      sex: ['', Validators.required],
      mobile: ['', Validators.required],
      home_latitude: ['', Validators.required],
      home_longitude: ['', Validators.required],
      profile: [''],
      driver_license_image: [''],
      vat: ['', Validators.required],
    });
     if (this.action === 'edit') {
      // console.log(this.parent, '[[[[[[[[[[[[[[[[[[[[[[[[[[[[');

      this.driverForm.patchValue(this.driver);
      this.profile = this.driver.profile;
      this.driver_license_image = this.driver.driver_license_image;
      // this.nationalIdImage = this.driver.nationalIdImage;

      // Por ejemplo, si tuvieras un @Input() parentData: any;
      // this.driverForm.patchValue(this.parentData);
    }
  }


  async onSubmit() {
    this.driverForm.markAllAsTouched();
    if (!this.driverForm.value.profile) {
      return;
    }

    if (this.driverForm.valid) {
      // this.modal.dismiss({
      //   action: this.action,
      //   driverForm: this.driverForm.value,
      // });

      // if (this.partner_id) {
      //   const data = {
      //     form: this.driverForm.value,
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
      Object.keys(this.driverForm.controls).forEach((key) => {
        const control = this.driverForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
        }
      });
    }
  }

   removeImage(cont: any) {
    if (cont == 1) {
      // this.driverForm.
      this.profile = '';
      this.driverForm.get('profile')?.setValue(this.profile);
    }
    if (cont == 2) {
      this.driver_license_image = '';
      this.driverForm.get('driver_license_image')?.setValue(this.driver_license_image);
    }
    // if (cont == 3) {
    //   this.responsibleGuardianImage = '';
    //   this.driverForm
    //     .get('responsibleGuardianImage')
    //     ?.setValue(this.responsibleGuardianImage);
    // }
  }

  handleImageCapture(event: any, cont: number): void {
    if (cont == 1) {
      // this.driverForm.
      this.profile = event;
      this.driverForm.get('profile')?.setValue(this.profile);
    }
    if (cont == 2) {
      this.driver_license_image = event;
      this.driverForm.get('driver_license_image')?.setValue(this.driver_license_image);
    }
    // if (cont == 3) {
    //   this.responsibleGuardianImage = event;
    //   this.driverForm
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
