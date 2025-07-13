import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-all-route',
  templateUrl: 'all-route.component.html',
  styleUrls: ['all-route.component.scss'],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  //  imports: [
  //   CommonModule,
  //   IonicModule,
  //   FormsModule,
  //   ReactiveFormsModule,
  // ],
})
export class AllRouteComponent {

   constructor(
      private translate: TranslateService
    ) {}

  @Input() route: any = null;
  @Output() handleActionClient = new EventEmitter<string>();


    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }

    showDetails() {
    this.handleActionClient.emit('edit')
  }
}
