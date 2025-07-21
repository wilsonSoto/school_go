import { Component, OnInit, Input, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Components, RefresherCustomEvent } from '@ionic/core'; // For ModalController type
import { Observable, forkJoin, of, throwError } from 'rxjs'; // Import throwError
import { tap, catchError, finalize, map } from 'rxjs/operators';

import { Driver } from '../../../interfaces/driver.interface'; // Import Driver interface
import { Bus } from '../../../interfaces/bus.interface';     // Import Bus interface
import { DriversService } from 'src/app/services/drivers.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  standalone: true,
  selector: 'app-select-driver-bus',
  templateUrl: './select-driver-bus.component.html',
  styleUrls: ['./select-driver-bus.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DriversService,
    VehiclesService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // If you use custom Ionic elements
})

export class SelectDriverBusComponent implements OnInit {
  @Input() initialDriverId: string | number | null = null;
  @Input() initialBusId: string | number | null = null;
  @Input() initialSelectedDriver: Driver | null = null;
  @Input() initialSelectedBus: Bus | null = null;

  availableDrivers: Driver[] = [];
  availableBuses: Bus[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  selectForm!: FormGroup; // Declare the FormGroup

  constructor(
    private modalController: ModalController,
    private driverService: DriversService,
    private busService: VehiclesService,
    private toastService: ToastService,
    private fb: FormBuilder // Inject FormBuilder
  ) {}

  ngOnInit() {
    this.selectForm = this.fb.group({
      driverId: [this.initialDriverId, Validators.required],
      busId: [this.initialBusId, Validators.required],
    });

    this.loadDriversAndBuses();

    // If initial full objects are provided, use them for display
    if (this.initialSelectedDriver) {
      // this.selectedDriver = this.initialSelectedDriver; // If needed for display logic here
    }
    if (this.initialSelectedBus) {
      // this.selectedBus = this.initialSelectedBus; // If needed for display logic here
    }
  }

   handleRefresh(event: RefresherCustomEvent) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  loadDriversAndBuses(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      drivers: this.driverService.getAllDrivers().pipe(
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
        this.availableDrivers = data.drivers;
        this.availableBuses = data.buses;
      console.log(this.availableBuses,'//////////////////////');
      console.log(this.availableDrivers,'//////////////////////');

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
    // Dismiss the modal without saving (cancel action)
  dismissModal2222222222222222(action: 'cancel' | 'select' = 'cancel'): void {
    if (action === 'cancel') {
      this.modalController.dismiss({ action: 'cancel' });
    } else {
      // Validate before dismissing
      if (this.selectForm.valid) {
        this.modalController.dismiss({
          action: 'select',
          selectedDriver: this.selectForm.get('selectedDriver')?.value,
          selectedBus: this.selectForm.get('selectedBus')?.value,
        });
      } else {
        // Optionally, show a toast or alert if the form is invalid
        console.warn('Form is invalid. Please select both a driver and a bus.');
      }
    }
  }
  // In select-driver-bus.component.ts
// ...
dismissModal(action: 'cancel' | 'select' = 'cancel'): void {
  if (action === 'cancel') {
    this.modalController.dismiss({ action: 'cancel' });
  } else {
    if (this.selectForm.valid) {
      this.modalController.dismiss({
        action: 'select',
        selectedDriver: this.selectForm.get('driverId')?.value, // <-- Changed from 'selectedDriver'
        selectedBus: this.selectForm.get('busId')?.value,       // <-- Changed from 'selectedBus'
      });
    } else {
      console.warn('Form is invalid. Please select both a driver and a bus.');
      this.toastService.presentToast('Por favor, seleccione un chofer y un autobús.', 'warning'); // Use your toast service for better UX
    }
  }
}
// ...

  async confirmSelection() {
    if (this.selectForm.valid) {
      const selectedDriverId = this.selectForm.value.driverId;
      const selectedBusId = this.selectForm.value.busId;

      const fullSelectedDriver = this.availableDrivers.find(d => d.id === selectedDriverId);
      const fullSelectedBus = this.availableBuses.find(b => b.id === selectedBusId);

      if (!fullSelectedDriver || !fullSelectedBus) {
        this.toastService.presentToast('No se pudieron encontrar los detalles completos del chofer o autobús seleccionado.', 'danger');
        return;
      }

      await this.modalController.dismiss({
        action: 'select',
        selectedDriver: fullSelectedDriver,
        selectedBus: fullSelectedBus,
      });
    } else {
      this.toastService.presentToast('Por favor, seleccione un chofer y un autobús.', 'warning');
      this.selectForm.markAllAsTouched(); // Show validation errors
    }
  }

  async cancel() {
    await this.modalController.dismiss({ action: 'cancel' });
  }

  //  Method to be called when the user clicks 'Select' button
  onSelect(): void {
    this.dismissModal('select');
  }
}
