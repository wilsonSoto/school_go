// shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllRouteComponent } from 'src/app/Components/all-route/all-rute.component';
// import { AllRouteComponent } from '../Components/all-route/all-rute.component';
import { IonicModule } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { CapitalCasePipe } from "../../pipes/capital-case.pipe";

@NgModule({
  declarations: [AllRouteComponent],
  imports: [CommonModule,
    IonicModule, CapitalCasePipe],
  exports: [AllRouteComponent],
})
export class SharedModule {}
