import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
} from '@ionic/angular';

import { CheckboxCustomEvent, IonModal } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core'; // Importa TranslateService

// register();

@Component({
  standalone: false,
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
   constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private loading: LoadingController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translate: TranslateService
  ) {
   
  }
  // Cambiar el idioma (por ejemplo, con un botón)
  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en'
    } else {
      lang = 'es'
      
    }
    this.translate.use(lang);
  }
}
