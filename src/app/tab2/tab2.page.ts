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
import { DriversService } from '../services/drivers.service';
import { ToastService } from '../services/toast.service';
import { VehiclesService } from '../services/vehicles.service';
import { Observable, forkJoin, of, throwError } from 'rxjs'; // Import throwError
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Driver } from '../interfaces/driver.interface';
import { Bus } from '../interfaces/bus.interface';
import { AddVehiclesComponent } from '../Components/add-vehicles/add-vehicles.component';

@Component({
  standalone: false,
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  constructor(
    private translate: TranslateService,
    private modalController: ModalController,
    private busService: VehiclesService,

          private toastService: ToastService,
          private driversService: DriversService,
  ) {}
typeSelect: any = 'first'
  // drivers: any = [1, 1, 1, 1];
  // vehicles: any = [1, 1, 1, 1];
   currentDrivers: any = []
   currentVehicles: any = []
 isLoading: boolean = true;
  errorMessage: string | null = null;

  ionViewWillEnter() {
    console.log('Tab3Page: ionViewWillEnter - La página va a ser visible');
    this.loadDriversAndBuses(); // Llama a tu función para cargar las rutas aquí
  }
  changeLanguage(lang: string) {
    if (lang == 'es') {
      lang = 'en';
    } else {
      lang = 'es';
    }
    this.translate.use(lang);
  }

  async handleOpenDriverModal(action: any, driver: any) {
    try {

      const modal = await this.modalController.create({
        component: AddDriversComponent,
        componentProps: {
          action: action,
          driver: driver,
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

  async handleOpenBusModal(action: any, bus: any) {
    try {

      const modal = await this.modalController.create({
        component: AddVehiclesComponent,
        componentProps: {
          action: action,
          bus: bus,
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

  loadDriversAndBuses(): void {
      this.isLoading = true;
      this.errorMessage = null;

      forkJoin({
        drivers: this.driversService.getAllDrivers().pipe(
            map((res: any) => res?.data?.school_drivers || []), // Adjust path if needed
            catchError(err => {
                console.error('Error fetching drivers:', err);
                // Wrap error in throwError to propagate it for the outer catchError
                return throwError(() => new Error(err.message || 'Failed to load drivers'));
            })
        ),
        buses: this.busService.getAllBuses().pipe(
            map((res: any) => res?.data?.school_buses || []), // Adjust path if needed
            catchError(err => {
                console.error('Error fetching buses:', err);
                // Wrap error in throwError to propagate it for the outer catchError
                return throwError(() => new Error(err.message || 'Failed to load buses'));
            })
        )
      }).pipe(
        tap((data: { drivers: Driver[], buses: Bus[] }) => {
          this.currentDrivers = data.drivers;
          this.currentVehicles = data.buses;
        // console.log(this.availableBuses,'//////////////////////');
        // console.log(this.availableDrivers,'//////////////////////');

        }),
        catchError(err => {
          // This catchError handles errors from any of the forkJoined observables
          console.error('Failed to load drivers or buses:', err);
          this.errorMessage = 'Error al cargar los conductores o autobuses: ' + (err.message || 'Error desconocido');
          return of(null); // Return observable of null to complete the stream gracefully
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe();
    }
}
