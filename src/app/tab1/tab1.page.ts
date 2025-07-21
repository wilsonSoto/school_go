import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular';

import { CheckboxCustomEvent, IonModal } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core'; // Importa TranslateService
import { ToastService } from '../services/toast.service';
import { AddParentComponent } from '../Components/add-parent/add-parent.component';
import { ParentService } from '../services/parents.service';
// register();

@Component({
  standalone: false,
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
   constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private loading: LoadingController,
    private alertController: AlertController,
    private parentService: ParentService,
    private toastService: ToastService,
    private translate: TranslateService ,
       private modalController: ModalController

  ) { }
  parents: any = [];
  students: any = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;
  ngOnInit() {
    this.getAllParents()
  }

     handleRefresh(event: RefresherCustomEvent) {
    this.getAllParents(); // Llama a tu función para cargar las rutas aquí
      setTimeout(() => {
        // Any calls to load data go here
        event.target.complete();
      }, 2000);
    }

    ionViewWillEnter() {
    console.log('Tab3Page: ionViewWillEnter - La página va a ser visible');
    this.getAllParents(); // Llama a tu función para cargar las rutas aquí
  }

  getAllParents() {
    this.isLoading = true;
    this.errorMessage = null;
        this.parentService
        .getAllParents()
        .subscribe({
          next: (response: any) => {
                    this.isLoading = false;
// console.log(response,'respo ,,,,,,,,,,,,,,,,,,,,,,');
            // response.data.parent.number_students = response.data.students?.length
            console.log(response,'parentsssssssssssssssss');

            this.parents = response.data.parents
            this.students = [response.data.students]
          this.toastService.presentToast('Bienvenido!','custom-success-toast')
          this.router.navigate(['tabs'])

      // this.mostrarAnimacion = false;

          },
          error: (err: any) => {
      // this.mostrarAnimacion = false;
              this.isLoading = false;
        this.errorMessage = 'Error al cargar padres: ' + (err.message || 'Error desconocido');

            const errorMessage =
              err?.error?.error.message ||
              err?.error?.error ||
              err?.message ||
              'Error desconocido';

            this.toastService.presentToast(errorMessage)

          },
        });
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


    async handleOpenClientModal(action: any, parent: any) {
      try {
        const modal = await this.modalController.create({
          component: AddParentComponent,
          componentProps: {
            action: action,
            // students: this.stupartner_iddents,
            partner_id: parent.partner_id,
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
