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
  markers: any[] = [];

  maps = true;
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

  get showBtnPermission () {
    const userData = JSON.parse(localStorage.getItem('userData') ?? "")

    if (userData?.roles?.some((rol: any) => rol.external_id == "pool.group_school_father")) {
      return 'partner'
    } else {
      return 'driver'

    }
    return
    }
  ngOnInit() {
    this.route_id = this.route.snapshot.paramMap.get('routeId');

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

     this.observerService.currentDriverLocation.subscribe(async(position) => {
       if (position) {
        this.setdriverLocation(position)
       }
     });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  sendInformation (group: any) {
      group.students.forEach((st: any) => {
      st.checked = false;
    });
    this.studentsInToSchoolGroup = group;
    this.isOpenApprovalStudents = true;
  }

    // Check if a student is currently selected
  isStudentSelected(studentId: string): boolean {
    return this.studentsInToSchool.some((control: any) => control.id === studentId);
  }

  // Handle checkbox change for a student
  onStudentCheckboxChange(event: CustomEvent, student: any): void {
    const isChecked = event.detail.checked;
    if (isChecked) {
      // Add student ID to FormArray if not already present
      if (!this.isStudentSelected(student.id)) {
        student.checked = true
        this.studentsInToSchool.push(student.id);
      }
    } else {
      // Remove student ID from FormArray
      const index = this.studentsInToSchool.findIndex((control: any) => control.id === student.id);
      if (index > -1) {
        this.studentsInToSchool.removeAt(index);
      } else {
        this.studentsInToSchool[index].checked = true
      }
    }
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
      this.maps = false
      this.routeTrackingPlannedService
        .getDriverCurrentLocation(this.route_id)
        .pipe(
          tap((response: any) => {

            if (response.data) {
              response.data.name = 'Ubicacion de chofer';
              response.data.lat = response.data.latitude
              response.data.lng = response.data.longitude
              this.markers.push(response.data);
              this.maps = true

            }
          }),
          catchError((err) => {
            // console.error('Error fetching students:', err);
              this.maps = true
            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
              this.maps = true
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {
              this.maps = true

    }
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
    const watchId = JSON.parse(localStorage.getItem('watchId') ?? '');
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

  async setdriverLocation(position: any) {
    // const watchId = false;
    try {
      // const location = await this.getLocation();
      const data = {
        route_id: this.route_id,
        lat: position.coords.latitude,
        lng: position.coords.longitude
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

  async markARouteAsVisited(group: any = null, checked: boolean = false, type: string = 'only', ) {
    try {
      let studentsIds: any = []
      let group_id: any = ''
      if (type == 'group') {
        this.isOpenApprovalStudents = false;
        group_id = this.studentsInToSchoolGroup.id
        console.log(this.studentsInToSchoolGroup?.students,'studentsInToSchoolGroup?.studentswilwiwliwlwi');
        studentsIds = this.studentsInToSchoolGroup?.students.map((st: any) => {
          return {
            student_id: st.id,
            is_present: st.checked

          }
        })
      } else {
        console.log(group?.students,'group?.studentswilwiwliwlwi');
        group_id = group.id
        studentsIds = group?.students.map((st: any) => {
          return {
            student_id: st.id,
            is_present: checked

          }
        })
        console.log(studentsIds,'studentsIds studentsIds');
      }
      const data =  {
        "point_id":  group_id,
        "students": studentsIds
        // [
        //     {
        //         "student_id": 1,
        //         "is_present": false
        //     }
        // ]
    };
      // const location = await this.getLocation();
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .markARouteAsVisited(this.route_id,data)
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
    // const watchId = false;
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
              this.stopTrackingLocation()
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
