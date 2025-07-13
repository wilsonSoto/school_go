import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActionSheetController,
  AlertController,
  CheckboxCustomEvent,
  ModalController,
} from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
// import { ProductsServices } from '../services/products.services';
import { filter } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AddDriversComponent } from '../Components/add-drivers/add-drivers.component';

@Component({
  standalone: false,
  selector: 'app-driver',
  templateUrl: 'driver.page.html',
  styleUrls: ['driver.page.scss'],
})
export class DriverPage {
  constructor(
    private translate: TranslateService,
    private modalController: ModalController
  ) {}
typeSelect: any = 'first'
  drivers: any = [1, 1, 1, 1];
  vehicles: any = [1, 1, 1, 1];
  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }

  async handleOpenDriverModal(action: any) {
    try {
      const modal = await this.modalController.create({
        component: AddDriversComponent,
        componentProps: {
          action: action,
        },
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        cssClass: ['loading-truck-options-sheet-modal'],
      });
      await modal.present();

      const { data } = await modal.onWillDismiss();
      const { selectedOption, exception } = data;

      if (data.action === 'cancel') {
        return;
      }
    } catch (error: any) {}
  }
}
