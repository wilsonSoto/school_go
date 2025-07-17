import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AlertController, IonPopover, ModalController } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ParentService } from 'src/app/services/parents.service';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SelectWeekDayComponent } from '../actions-services/select-week-day/select-week-day.component';
import { CommonModule } from '@angular/common';
import { SelectDriverBusComponent } from '../actions-services/select-driver-bus/select-driver-bus.component';
import { SelectStudentsModalComponent } from '../actions-services/select-students-modal/select-students-modal.component';
import { ReorderStudentsMapModalComponent } from '../actions-services/reorder-students-map-modal/reorder-students-map-modal.component';
import { Student } from 'src/app/interfaces/student.interface';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StudentsService } from 'src/app/services/students.service';
import { Driver } from 'src/app/interfaces/driver.interface'; // Import Driver interface
import { Bus } from 'src/app/interfaces/bus.interface'; // Import Bus interface
import { RouteService } from 'src/app/services/route.service';

import { Subject, Subscription } from 'rxjs';
import { StudentGroup } from 'src/app/interfaces/student-group.interface';
import { MapsComponent } from '../actions-services/maps/maps.component';
import { LocationService } from 'src/app/services/geolocation.service';
import { RouteTrackingPlannedService } from 'src/app/services/route-tracking-planned.service';
import { getDistanceAndCheckRadius } from 'src/app/shared/utils/getDistanceAndCheckRadius';
import { ObserverBetweenComponentsService } from 'src/app/services/observer-between-components.services';

@Component({
  standalone: true,
  selector: 'app-planned-route',
  templateUrl: 'planned-route.component.html',
  styleUrls: ['planned-route.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MapsComponent,
  ],
})
export class PlannedRouteComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    private routeService: RouteService,
    private routeTrackingPlannedService: RouteTrackingPlannedService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private locationService: LocationService,
    private alertController: AlertController,

    private observerService: ObserverBetweenComponentsService,
    private toastService: ToastService
  ) {}

  @Input() action: string = '';
  @Input() partner_id: any = null;

  @ViewChild('timePopover') timePopover!: IonPopover;
  markers: any = [];

  showCalendar = false;
  selectedDays: any[] = [];
  selectedDayForPopover: any = null;
  isPopoverOpen: boolean = false;
  selectedStudents: Student[] = [];
  selectedStudentsForRoute: Student[] = [];
  allStudents: any[] = [];

  isOpenApprovalStudents: boolean = false;
  isLoadingMap: boolean = true;
  errorMessage: string | null = null;

  colorCalendar = 'dark';
  date = new Date();
  route_id: any = null;
  planned_route: any = null;
  // currentDriver: any = null // <<< Remove this or make it Driver | null
  selectedDriver: Driver | null = null; // New property to store the full driver object
  selectedBus: Bus | null = null; // New property to store the full bus object

  get defaultHref(): string {
    let href = '/tabs';
    return href;
  }
  private routeSubscription: Subscription | undefined;

  ruteForm!: FormGroup;
  reorderableStudentGroups: StudentGroup[] = [];
  studentsInToSchool: any = [];
  studentsInToSchoolGroup: any = []

  ngOnInit() {
    // this.initForm();
    this.route_id = this.route.snapshot.paramMap.get('routeId');
    // console.log(this.route_id, 'id -------------------------------');

    if (this.route_id) {
      this.getRute();
    }
    this.observerService.currentMessage.subscribe(async(position) => {
       if (position) {
        const studentsNotVisited =  this.planned_route.route_points.students.filter((student: any) => {
          return !this.planned_route.route_points.student_visiteds.some((visited: any) => visited.id === student.id);
        });

            studentsNotVisited.forEach((student: any) => {
              this.getDistanceAndCheckRadius(student, position)
            })

       }
     });

  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  sendInformation (group: any) {
    this.studentsInToSchoolGroup = group;
console.log(group,'/;/.................');

    this.isOpenApprovalStudents = true;
  }

    // Check if a student is currently selected
  isStudentSelected(studentId: string): boolean {
    console.log(studentId,'isStudentSelected ------------------------------------');
    console.log(this.studentsInToSchool,'this.studentsInToSchool ------------------------------------');

    return this.studentsInToSchool.some((control: any) => control.id === studentId);
  }

  // Handle checkbox change for a student
  onStudentCheckboxChange(event: CustomEvent, student: Student): void {
    const isChecked = event.detail.checked;
    if (isChecked) {
      // Add student ID to FormArray if not already present
      if (!this.isStudentSelected(student.id)) {
        this.studentsInToSchool.push(student.id);
      }
    } else {
      // Remove student ID from FormArray
      const index = this.studentsInToSchool.findIndex((control: any) => control.id === student.id);
      if (index > -1) {
        this.studentsInToSchool.removeAt(index);
      }
    }
    console.log('Current selected student IDs:', this.studentsInToSchool);
  }
  async getDistanceAndCheckRadius(studentsLatLng: any, position: any) {
    const baseLat = studentsLatLng.home_latitude; //18.48123;
    const baseLng = studentsLatLng.home_longitude; //-69.9333;
    const currentLat = position.coords.latitude; //18.48123;
    const currentLng = position.coords.longitude; //-69.9332;
    try {
      const result = getDistanceAndCheckRadius(
        baseLat,
        baseLng,
        currentLat,
        currentLng
      );

      if (result.isInside) {
        this.toastService.presentToast(
          `📍 Dentro del área. Distancia: ${result.distance.toFixed(2)} m`
        );

        console.log(
          `📍 Dentro del área. Distancia: ${result.distance.toFixed(2)} m`
        );
        // return true;
      }
      // } else {
      //   this.toastService.presentToast(
      //     `❌ Fuera del área. Distancia: ${result.distance.toFixed(2)} m`
      //   );

      //   console.log(
      //     `❌ Fuera del área. Distancia: ${result.distance.toFixed(2)} m`
      //   );
      //   return false;
      // }
    } catch (error) {
      // return false;
    }
  }

  // createScheduleGroup(schedule: RouteSchedule): FormGroup {
  //   return this.fb.group({
  //     session_start_time: [schedule.session_start_time, Validators.required],
  //     session_end_time: [schedule.session_end_time, Validators.required],
  //     day: [schedule.day, Validators.required],
  //     name: [schedule.name, Validators.required],
  //     checked: [schedule.checked, Validators.required],
  //   });
  // }

  // addSchedule(schedule?: any): void {
  //   const newSchedule = schedule || {
  //     session_start_time: '',
  //     session_end_time: '',
  //     day: '',
  //     name: '',
  //     checked: false,
  //   };
  //   this.schedulesFormArray.push(this.createScheduleGroup(newSchedule));
  // }

  // removeSchedule(index: number): void {
  //   this.schedulesFormArray.removeAt(index);
  // }

  // setSchedules(schedules: RouteSchedule[]): void {
  //   this.schedulesFormArray.clear();
  //   const dataSchedule = schedules.map((sc: any) => {
  //     return {
  //       session_start_time: sc.session_start_time.label,
  //       session_end_time: sc.session_end_time.label,
  //       day: sc.day.value,
  //       name: sc.day.label,
  //       checked: true,
  //     };
  //   });

  //   this.selectedDays = dataSchedule;

  //   dataSchedule.forEach((schedule) => this.addSchedule(schedule));
  // }

  async onMarkerMoved(event: { id: string; lat: number; lng: number }) {
    console.log('🟢 Marcador movido:', event);
    const index = Number(event.id);

    if (index >= 0 && index < this.markers.length) {
      // Actualiza el marcador
      this.markers[index].lat = event.lat;
      this.markers[index].lng = event.lng;

      // Espera confirmación
      const alert = await this.alertController.create({
        header: '¿Actualizar ubicación?',
        message: `¿Deseas aplicar esta nueva ubicación también en ${this.markers[index].name}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Actualizar',
            handler: () => {
              const movedMarker = this.markers[index];
              this.updateGroupOrStudentCoordinates(movedMarker);
              console.log(
                this.reorderableStudentGroups,
                'this.reorderableStudentGroups'
              );
            },
          },
        ],
      });

      await alert.present();
    } else {
      console.warn('Índice fuera de rango');
    }
  }

  updateGroupOrStudentCoordinates(marker: {
    id: any;
    lat: number;
    lng: number;
  }) {
    for (const group of this.reorderableStudentGroups) {
      // 1. Verifica si es un grupo (coincide con group.id)
      if (group.id === marker.id) {
        group.point_latitude = marker.lat;
        group.point_longitude = marker.lng;
        console.log(`📍 Coordenadas actualizadas para el grupo: ${group.name}`);
        return;
      }

      // 2. Verifica si es un estudiante (coincide con student.id)
      if (Array.isArray(group.students)) {
        for (const student of group.students) {
          if (student.id === marker.id) {
            student.home_latitude = marker.lat;
            student.home_longitude = marker.lng;
            console.log(
              `📍 Coordenadas actualizadas para el estudiante: ${student.name}`
            );
            return;
          }
        }
      }
    }

    console.warn('❌ No se encontró el grupo o estudiante para actualizar');
  }

  getTotalStudents(): number {
    return this.reorderableStudentGroups.reduce(
      (count, group) => count + group.students.length,
      0
    );
  }
  getStudentName(id: string): string {
    const student = this.allStudents.find((s) => s.id === id);

    // const student = this.selectedStudentsForRoute.find(s => s.id === id);
    return student ? `${student.name} ${student.last_name}` : 'Unknown Student';
  }
  // NEW HELPER METHOD FOR COORDINATES
  getStudentCoordinates(studentId: string): {
    home_latitude: number | undefined;
    home_longitude: number | undefined;
  } {
    const student = this.selectedStudentsForRoute.find(
      (s) => s.id === studentId
    ) ?? { home_latitude: 0, home_longitude: 0 };
    return {
      home_latitude: student?.home_latitude,
      home_longitude: student?.home_longitude,
    };
  }

  getRute() {
    this.routeSubscription = this.routeService
      .getRoute(this.route_id)
      .pipe(
        tap((response: any) => {
          if (response.data) {
            const routeData = response.data.school_route;
            const students = routeData.route_points.map((route: any) => {
              if (!Array.isArray(route.students)) {
                route.students = [route.students];
              }
              return route;
            });

            routeData.route_points.students = [students];
            this.planned_route = routeData;
          }
        }),
        catchError((err) => {
          console.error('Error fetching students:', err);
          this.errorMessage =
            'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
          // this.reorderableStudentGroups = [];
          return of([]);
        }),
        finalize(() => {
          setTimeout(() => {}, 0);
        })
      )
      .subscribe();
  }

  // async onSubmit() {
  //   this.ruteForm.markAllAsTouched();

  //   this.schedulesFormArray.controls.forEach((group: any, index) => {
  //     // console.log(`Schedule Group ${index} Valid?`, group.valid);
  //     Object.keys(group.controls).forEach((key) => {
  //       const control = group.get(key);
  //       if (control && control.invalid) {
  //         // console.log(`  Control ${key} invalid. Errors:`, control.errors);
  //       }
  //     });
  //   });

  //   if (this.ruteForm.valid) {
  //     const userData = JSON.parse(localStorage.getItem('userData') ?? '{}');

  //     const data = {
  //       name: this.ruteForm.value.name,
  //       schedules: this.ruteForm.value.schedules,
  //       partner_id: this.partner_id,
  //       company_id: userData.company.id ?? null,
  //       action: this.action,
  //       driverId: this.ruteForm.value.driverId, // Include driverId
  //       busId: this.ruteForm.value.busId, // Include busId
  //       student_ids: this.ruteForm.value.student_ids, // Include selected student IDs
  //       student_ids_pickup_order: this.ruteForm.value.student_ids_pickup_order, // Include pickup order
  //     };

  //     const observableResponse = await this.routeService.postParent(data);

  //     observableResponse.subscribe({
  //       next: (response: any) => {
  //         const msm = this.action == 'edit' ? 'Ruta Editada' : 'Ruta Agregada';
  //         this.toastService.presentToast(msm, 'custom-success-toast');
  //         // Optionally, dismiss modal or navigate
  //       },
  //       error: (err: any) => {
  //         const errorMessage =
  //           err.error.error.message ||
  //           err.error.error ||
  //           err?.message ||
  //           'Error desconocido al agregar/editar ruta';
  //         this.toastService.presentToast(errorMessage);
  //       },
  //     });
  //   } else {
  //     // console.log('Formulario inválido. Errores por campo:');
  //     Object.keys(this.ruteForm.controls).forEach((key) => {
  //       const control = this.ruteForm.get(key);
  //       if (control && control.invalid) {
  //         // console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
  //       }
  //     });
  //   }
  // }

  // loadStudents(allFetchedStudents: Student[]): void {
  //   this.isLoadingMap = true;
  //   this.errorMessage = null;
  //   this.allStudents = allFetchedStudents.map((student) => ({
  //     ...student,
  //     home_latitude: student.home_latitude ?? 0, // Default to 0 if null/undefined
  //     home_longitude: student.home_longitude ?? 0, // Default to 0 if null/undefined
  //   }));
  // }

  async getLocation() {
    try {
      let local = await this.locationService.getCurrentLocation();
      if (!local) {
        local = { latitude: 0, longitude: 0 };
      }
      return local;
    } catch (error) {
      console.log(error);

      return error;
    }
  }
  // request
  getDriverCurrentLocation() {
    // const watchId = false;
    try {
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .getDriverCurrentLocation(this.route_id)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
              response.data.name = 'Ubicacion de chofer';
              this.markers = [...response.data];
            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  getTheNextPoint() {
    const watchId = false;
    try {
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .getTheNextPoint(this.route_id)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  stopTrackingLocation() {
    const watchId = localStorage.getItem('watchId');
    this.locationService.stopTrackingLocation(watchId);
  }

  async startTrackingLocation() {
    // const watchId = false;
    try {
      const location = await this.getLocation();
      const data = {
        route_id: this.route_id,
        lat: location.latitude,
        lng: location.longitude,
      };

      this.routeSubscription = this.routeTrackingPlannedService
        .startTheRoute(data)
        .pipe(
          tap((response: any) => {
            if (response) {
              console.log(response);
              const watchId: any =
                this.locationService.startTrackingLocation();
              if (watchId) {
                localStorage.setItem('watchId', watchId);
              }
            }
          }),
          catchError((err) => {
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  async setdriverLocation() {
    const watchId = false;
    try {
      const location = await this.getLocation();
      const data = {
        route_id: this.route_id,
        lat: location.latitude,
        lng: location.longitude,
      };
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .setdriverLocation(data)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  async markARouteAsVisited() {
    const watchId = false;
    try {
      const location = await this.getLocation();

      const data = {
        route_id: this.route_id,
        lat: location.latitude,
        lng: location.longitude,
      };
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .markARouteAsVisited(data)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  async setEndTheRoute() {
    const watchId = false;
    try {
      const location = await this.getLocation();

      const data = {
        route_id: this.route_id,
        lat: location.latitude,
        lng: location.longitude,
      };
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .setEndTheRoute(data)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }
}

interface RouteSchedule {
  session_start_time: string;
  session_end_time: string;
  day: string;
  name: string;
  checked: boolean;
}
