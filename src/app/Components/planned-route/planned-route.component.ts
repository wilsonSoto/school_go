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
import {
  AlertController,
  IonPopover,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Student } from 'src/app/interfaces/student.interface';
import { tap, catchError, finalize, switchMap, map } from 'rxjs/operators';
import { Observable, of, interval, Subscription } from 'rxjs';
import { StudentsService } from 'src/app/services/students.service';
import { Driver } from 'src/app/interfaces/driver.interface'; // Import Driver interface
import { Bus } from 'src/app/interfaces/bus.interface'; // Import Bus interface
import { RouteService } from 'src/app/services/route.service';

// import { Subject, Subscription } from 'rxjs';
import { StudentGroup } from 'src/app/interfaces/student-group.interface';
import { MapsComponent } from '../actions-services/maps/maps.component';
import { LocationService } from 'src/app/services/geolocation.service';
import { RouteTrackingPlannedService } from 'src/app/services/route-tracking-planned.service';
import { getDistanceAndCheckRadius } from 'src/app/shared/utils/getDistanceAndCheckRadius';
import { ObserverBetweenComponentsService } from 'src/app/services/observer-between-components.services';
import { hostUrlEnum, userRoleEnum } from 'src/types';
import { FcmService } from 'src/app/services/fcm.service';
import { StorageService } from 'src/app/services/storage.service';
import { cleanToken } from 'src/app/shared/utils/cleanToken';
import { ChatPreviewComponent } from '../actions-services/chat-preview/chat-preview.component';

// import { interval, of, Subscription } from 'rxjs';
// import { switchMap, tap, catchError, finalize } from 'rxjs/operators';

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
export class PlannedRouteComponent implements OnInit, OnDestroy {
  constructor(
    private modalController: ModalController,
    private routeService: RouteService,
    private routeTrackingPlannedService: RouteTrackingPlannedService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private locationService: LocationService,
    private alertController: AlertController,
    private fcmService: FcmService,
    private storage: StorageService,

    private observerService: ObserverBetweenComponentsService,
    private toastService: ToastService
  ) {}

  @Input() action: string = '';
  @Input() partner_id: any = null;

  @ViewChild('timePopover') timePopover!: IonPopover;
  markers: any[] = [];
  // private locationS

  private locationSub!: Subscription;
  rutaDelBus = false;
  maps = false;
  showCalendar = false;
  selectedDays: any[] = [];
  selectedDayForPopover: any = null;
  isPopoverOpen: boolean = false;
  selectedStudents: Student[] = [];
  selectedStudentsForRoute: Student[] = [];
  allStudents: any[] = [];
  isAccordionSelect = 'third';
  isOpenApprovalStudents: boolean = false;
  isLoadingMap: boolean = true;
  errorMessage: string | null = null;

  colorCalendar = 'dark';
  date = new Date();
  route_id: any = null;
  planned_route: any = null;
  selectedDriver: Driver | null = null; // New property to store the full driver object
  selectedBus: Bus | null = null; // New property to store the full bus object

  isLoading: boolean = true;
  // errorMessage: string | null = null;
  get defaultHref(): string {
    let href = '/tabs';
    return href;
  }
  private routeSubscription: Subscription | undefined;

  ruteForm!: FormGroup;
  reorderableStudentGroups: StudentGroup[] = [];
  studentsInToSchool: any = [];
  studentsInToSchoolGroup: any = [];
  userData: any = null;

  get isShowButton(): boolean {
    const role = this.showBtnPermission as unknown as string;
    const state = this.planned_route?.state as unknown as string;
    return role === 'partner' || state === 'to-start' || state === 'Completada';
  }


  get showBtnPermission() {
    if (
      this.userData?.roles?.some(
        (rol: any) => rol.external_id == userRoleEnum.partner
      )
    ) {
      this.isAccordionSelect = 'first';
      return 'partner';
    } else if (
      this.userData?.roles?.some(
        (rol: any) => rol.external_id == userRoleEnum.driver
      )
    ) {
      this.isAccordionSelect = 'third';
      this.rutaDelBus = true;
      return 'driver';
    }
    return 'admin';
  }

  async ngOnInit() {
    this.route_id = this.route.snapshot.paramMap.get('routeId');
    this.userData = JSON.parse(localStorage.getItem('userData') ?? '{}');

    if (this.route_id) {
      this.getRute();
    }

    if (
      this.userData?.roles?.some(
        (rol: any) => rol.external_id == userRoleEnum.partner
      )
    ) {
      try {
        const position = await this.getLocation();
        const { latitude, longitude } = position.coords ?? position;
        const data = {
          name: 'Mi ubicación',
          lat: latitude,
          lng: longitude,
          id: '1-pt',
        };

        this.markers.push(data);
      } catch (error) {
        console.log(error);
      }
    }
  }

async  sendProximityNotification() {
    let token = 'n/a';
    // alert(1);
    this.storage.get(hostUrlEnum.FCM_TOKEN).then(async (resp) => {
      token = JSON.stringify(resp);
      // console.log(token, '11111111111111111111111111');
      // alert(2);
        let tokenReview = await cleanToken(token);
  // try {

  //   // si viene como '"abc"', lo parsea a abc
  //   if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
  //     raw = JSON.parse(raw);
  //   }
  // } catch (_) {}
  // const cleanToken = String(raw).trim()
  //   .replace(/^"+|"+$/g, '')  // quita " al inicio/fin
  //   .replace(/^'+|'+$/g, ''); // quita ' al inicio/fin


      const notificationData = {
        token:  tokenReview ?? null,
        msm: `Tu transporte está llegando cerca de ti (prueba)`,
        title: 'Transporte escolar cerca',
      };

      if (notificationData.token) {
        this.fcmService
          .sendNotification(notificationData)
          .pipe(
            tap((response: any) => {
              if (response.data) {
                console.log(response);
                console.log('✅ Notificación enviada', response);
                this.toastService.presentToast(JSON.stringify(response));
              }
            }),
            catchError((err) => {
              this.isLoading = false;
              this.toastService.presentToast(JSON.stringify(err));
              this.toastService.presentToast(token);
              this.toastService.presentToast(JSON.stringify(notificationData));

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
      } else {
        console.warn(`⚠️ No se encontró token FCM para prueba`);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.stopDriverTracking();
  }

    async openChatModal(info: any) {
      console.log('==================student==================');
      console.log(info);
      console.log('===============student=====================');
    const modal = await this.modalController.create({
      component: ChatPreviewComponent,
      componentProps: {
        infoMSM: info,
        // subtitle: this.allStudents,
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'select' && data.selectedStudentIds) {

    }
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.getRute(); // Llama a tu función para cargar las rutas aquí
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  sendInformation(group: any) {
    group.students.forEach((st: any) => {
      st.checked = false;
    });
    this.studentsInToSchoolGroup = group;
    this.isOpenApprovalStudents = true;
  }

  // Check if a student is currently selected
  isStudentSelected(studentId: string): boolean {
    return this.studentsInToSchool.some(
      (control: any) => control.id === studentId
    );
  }

  isStudentVisited(student: any): boolean {
    const studentPoint = this.planned_route.route_points?.find((route: any) =>
      route.students?.some((s: any) => s.id === student.id)
    );

    if (!studentPoint) {
      return false;
    }

    const visit = studentPoint.student_visiteds.find(
      (v: any) => v.student.id === student.id
    );

    if (visit) {
      return !visit.was_present;
    }

    return true;
  }

  // Handle checkbox change for a student
  onStudentCheckboxChange(event: CustomEvent, student: any): void {
    const isChecked = event.detail.checked;
    if (isChecked) {
      // Add student ID to FormArray if not already present
      if (!this.isStudentSelected(student.id)) {
        student.checked = true;
        this.studentsInToSchool.push(student.id);
      }
    } else {
      // Remove student ID from FormArray
      const index = this.studentsInToSchool.findIndex(
        (control: any) => control.id === student.id
      );
      if (index > -1) {
        this.studentsInToSchool.removeAt(index);
      } else {
        this.studentsInToSchool[index].checked = true;
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

  // generateMarkersFromGroups22(
  //   groups: any[]
  // ): { lat: number; lng: number; name: string; id: any }[] {
  //   const markers: {
  //     lat: number;
  //     lng: number;
  //     name: string;
  //     id: any;
  //     visit_order: number;
  //   }[] = [];

  //   for (const group of groups) {
  //     // Saltar si ya fue visitado
  //     if (group.is_visited) continue;

  //     const hasGroupCoords = group.point_latitude && group.point_longitude;

  //     if (hasGroupCoords) {
  //       markers.push({
  //         lat: group.point_latitude,
  //         lng: group.point_longitude,
  //         name: group.name,
  //         id: group.id,
  //         visit_order: group.visit_order ?? 999, // por si no tiene valor
  //       });
  //     } else if (Array.isArray(group.students)) {
  //       for (const student of group.students) {
  //         const hasStudentCoords =
  //           student.home_latitude && student.home_longitude;
  //         if (hasStudentCoords) {
  //           markers.push({
  //             lat: student.home_latitude,
  //             lng: student.home_longitude,
  //             name: student.name,
  //             id: student.id,
  //             visit_order: group.visit_order ?? 999,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   // Ordenar por visit_order
  //   const sorted = markers.sort((a, b) => a.visit_order - b.visit_order);

  //   return sorted.map(({ visit_order, ...rest }) => rest); // remover visit_order del resultado final
  // }

  generateMarkersFromGroups(groups: any[]): {
    lat: number;
    lng: number;
    name: string;
    id: any;
      is_student_point?: boolean;
    fcm_token?: string | boolean; // 👈 opcional, puede ser string o false
  }[] {
    const markers: {
      lat: number;
      lng: number;
      name: string;
      id: any;
      is_student_point?: boolean;
      fcm_token?: string | boolean;
      visit_order: number;
    }[] = [];

    for (const group of groups) {
      // Saltar si ya fue visitado
      console.log(group, ';;lhhhhhhhhhhhhhhhhhh**********************************************************************************hhhhhhhhhhhhhh');

      if (group.is_visited) continue;

      const hasGroupCoords = group.point_latitude && group.point_longitude;
      // const toke =
      //   'ftzFexWbSsS0IOKWb1DNZV:APA91bFd5PxVCS7MLvei7baq5YZYS55FKW49EkfIJBw2_RNzJ0xgU2g3NIsXyGdUqd9y4qa5lXtMUnxhLhjZMW23rHj5EpYPpJMxzKaPHDDNez_itINnPyM';
     if (Array.isArray(group.students) && group.students.length > 0) {
        for (const student of group.students) {
          const hasStudentCoords =
            student.home_latitude && student.home_longitude;
          if (hasStudentCoords) {
            markers.push({
              lat: student.home_latitude,
              lng: student.home_longitude,
              name: student.name,
              id: student.id,
          is_student_point: true,
              fcm_token:
                student.fcm_token ?? student.company?.fcm_token , // 👈 token del estudiante o empresa
              visit_order: group.visit_order ?? 999,
            });
          }
        }
      } else if (hasGroupCoords) {
        markers.push({
          lat: group.point_latitude,
          lng: group.point_longitude,
          name: group.name,
          id: group.id,
          is_student_point: group.is_student_point,
          fcm_token: group.fcm_token , // 👈 aquí se asigna el token
          visit_order: group.visit_order ?? 999,
        });
      }
    }

    // Ordenar por orden de visita
    const sorted = markers.sort((a, b) => a.visit_order - b.visit_order);

    // Eliminar el campo 'visit_order' antes de devolver
    return sorted.map(({ visit_order, ...rest }) => rest);
  }
  getVisiblePoints(route: any): any[] {
  const type = (route.route_type || "").toLowerCase();
  const showOrigin = type === "recogida";
  const showTarget = type === "entrega";

  return route.route_points
    .filter((p:any) =>
      // siempre mostrar estudiantes y otros puntos normales
      p.is_student_point ||
      (!p.is_student_point && !p.is_origin_point && !p.is_target_point) ||
      // mostrar solo uno de origen/destino
      (showOrigin && p.is_target_point) ||
      (showTarget && p.is_origin_point)
    )
    // .sort((a:any, b:any) => a.visit_order - b.visit_order);
}
  getRute() {
    this.maps = false;
    this.isLoading = true;
    this.errorMessage = null;
    this.routeSubscription = this.routeService
      .getRoute(this.route_id)
      .pipe(
        tap(async (response: any) => {
          if (response.data) {
            const routeData = response.data.school_route;
            const students = routeData.route_points.map((route: any) => {
              if (!Array.isArray(route.students)) {
                route.students = [route.students];
              }
              return route;
            });

            let driver: any = {};
            // try {
            const location = await this.getLocation();
            driver.id = '1-dr';
            driver.name = 'Ubicacion de chofer';
            driver.is_student_point = false;
            driver.point_latitude = location.latitude;
            driver.point_longitude = location.longitude;
            // let add: any = {}
            // add.id = '1-add';
            // add.name = 'Ubicacion de sambil';
            // add.point_latitude = 18.482384;
            // add.point_longitude = -69.911896;
            routeData.route_points.students = [...students];
            routeData.route_points.unshift(driver);
            // routeData.route_points.push(add);
            console.log('====================================');
            console.log();
            console.log('====================================');
            this.planned_route = routeData;
            if (this.showBtnPermission !== 'partner') {
              const route_points = this.getVisiblePoints(routeData);
console.log('================route_points====================');
console.log(route_points);
console.log('==============route_points======================');
              this.markers = this.generateMarkersFromGroups(route_points);
            }

            // } catch (error) {
            //   console.log(JSON.stringify(error),'No se pudo location la rutalocation------------------erereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-------------------------------------------------------------------------------------------------------------------------------------------' );

            // }
            // console.log(
            //   this.planned_route,
            //   '?????????????????????????????????////////@@@@@'
            // );
            // console.log(
            //   this.markers,
            //   '??????????????????????????dd???????////////@@@@@'
            // );
          }
          this.maps = true;
          this.isLoading = false;
        }),
        catchError((err) => {
          this.isLoading = false;
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
      // console.log('33333333333');

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
  async getDriverCurrentLocation() {
    this.isLoading = true;
    this.errorMessage = null;
    this.maps = false;
    try {
      const position = await this.getLocation();
      const { latitude, longitude } = position.coords ?? position;
      // console.log(
      //   JSON.stringify(position),
      //   'No se pudo location la position-----------------------------position---------------------------------------------position-----------------------------------------------------------------------------------'
      // );

      const data = {
        name: 'Mi ubicación',
        lat: latitude,
        lng: longitude,
        id: '1-pt',
      };
      this.routeTrackingPlannedService
        .getDriverCurrentLocation(this.route_id)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              response.data.name = 'Ubicacion de chofer';
              response.data.lat = response.data.latitude;
              response.data.lng = response.data.longitude;
              this.markers.push(response.data);
              this.markers.push(data);
              this.maps = true;
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.maps = true;
            this.isLoading = false;

            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            return of([]);
          }),
          finalize(() => {
            this.maps = true;
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {
      this.maps = true;
    }
  }
  // ub: Subscription;

  async startDriverTracking() {
    // 🛑 Por si se repite la función, cancelamos la previa
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }

    let position: any = {};
    let data: any = {};
    try {
      position = await this.getLocation();
      // if (position) {
      // 🔹 Notificar a ObserverService
      // this.observerService.changeDriverLocation(position);
      console.log('📡 Posición actual:', position.coords);

      // 🔹 Tu lógica para markers
      const { latitude, longitude } = position.coords ?? position;
      data = {
        name: 'Mi ubicación',
        lat: latitude,
        lng: longitude,
        id: '1-pt',
        is_student_point: false,

      };
    } catch (error) {
      console.log(error);
    }

    // Cada 15 segundos
    this.locationSub = interval(5000)
      .pipe(
        switchMap(async () => {
          try {
            // const position = await this.getLocation();
            if (position) {
              return this.routeTrackingPlannedService
                .getDriverCurrentLocation(this.route_id)
                .pipe(
                  tap((response: any) => {
                    if (response.data) {
                      response.data.id = '1-dr';
                      // console.log('1111111111111111111111111111111', response);
                      this.markers = [];
                      response.data.name = 'Ubicación de chofer';
                      response.data.is_student_point = false;
                      // response.data.lat = response.data.latitude;
                      console.log('222222222222222222222222222222');

                      response.data.lng = response.data.longitude;
                      this.markers.push(response.data);
                      // this.markers.push(position);
                      this.maps = true;
                      let driverPosition: any = {
                        coords: {},
                      };
                      // this.locationService.simulateMovement(response.data.latitude, response.data.longitude);
                      console.log('3333333333333333333333333', response);

                      driverPosition.coords.latitude = response.data.latitude;
                      driverPosition.id = '1-dr';
                      console.log(
                        '444444444444444444444444444',
                        driverPosition
                      );

                      driverPosition.coords.longitude = response.data.longitude;
                      this.observerService.changeDriverLocation(driverPosition);
                    }
                    this.isLoading = false;
                  }),
                  catchError((err) => {
                    this.maps = true;
                    this.isLoading = false;
                    this.errorMessage =
                      'Error al cargar el chofer. Por favor, inténtelo de nuevo. Error: ' +
                      err;
                    return of([]);
                  }),
                  finalize(() => {
                    this.maps = true;
                    setTimeout(() => {}, 0);
                  })
                )
                .toPromise(); // 👈 convertimos observable a promesa porque estamos en async
            }
          } catch (error) {
            this.maps = true;
            return of([]);
          }
        })
      )
      .subscribe();
  }

  // 🛑 Para detener el tracking (ejemplo: al salir de la página)
  stopDriverTracking() {
    // alert(1)
    if (this.locationSub) {
      // alert(2)

      this.locationSub.unsubscribe();
    }
  }

  getTheNextPoint() {
    const watchId = false;

    this.isLoading = true;
    this.errorMessage = null;
    try {
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .getTheNextPoint(this.route_id)
        .pipe(
          tap((response: any) => {
            if (response.data) {
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;

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
    this.isLoading = true;
    this.errorMessage = null;
    // const watchId = false;
    try {
      // console.log('1111');

      const location = await this.getLocation();
      const data = {
        route_id: this.route_id,
        lat: location.latitude,
        lng: location.longitude,
      };
      // console.log('222222');

      this.routeSubscription = this.routeTrackingPlannedService
        .startTheRoute(data)
        .pipe(
          tap(async (response: any) => {
            if (response) {
              // console.log(response);
              try {
                const watchId: any =
                  await this.locationService.startTrackingLocation();
                if (watchId) {
                  localStorage.setItem('watchId', JSON.stringify(watchId));
                }
              } catch (error) {
                console.log(error, '333/////////////////////////////////');
              }
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;
            console.log(
              err,
              'ereer00000000000000000000000000000000000000000000000000000000000000000rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
            );

            this.errorMessage =
              'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;

            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {
      console.log(
        error,
        'ereerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
      );
    }
  }

  async setdriverLocation(position: any) {
    // const watchId = false;

    this.isLoading = true;
    this.errorMessage = null;
    try {
      // const location = await this.getLocation();
      const data = {
        route_id: this.route_id,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      // this.routeSubscription = this.routeService
      this.routeTrackingPlannedService
        .setdriverLocation(data)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;
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

  async markARouteAsVisited(
    group: any = null,
    checked: boolean = false,
    type: string = 'only'
  ) {
    try {
      let studentsIds: any = [];
      let group_id: any = '';
      if (type == 'group') {
        this.isOpenApprovalStudents = false;
        group_id = this.studentsInToSchoolGroup.id;
        // console.log(this.studentsInToSchoolGroup?.students,'studentsInToSchoolGroup?.studentswilwiwliwlwi');
        studentsIds = this.studentsInToSchoolGroup?.students.map((st: any) => {
          return {
            student_id: st.id,
            is_present: st.checked,
          };
        });
      } else {
        // console.log(group?.students,'group?.studentswilwiwliwlwi');
        group_id = group.id;
        studentsIds = group?.students.map((st: any) => {
          return {
            student_id: st.id,
            is_present: checked,
          };
        });
        // console.log(studentsIds,'studentsIds studentsIds');
      }
      const data = {
        point_id: group_id,
        students: studentsIds,
        // [
        //     {
        //         "student_id": 1,
        //         "is_present": false
        //     }
        // ]
      };
      // const location = await this.getLocation();
      // this.routeSubscription = this.routeService

      this.isLoading = true;
      this.errorMessage = null;
      this.routeTrackingPlannedService
        .markARouteAsVisited(this.route_id, data)
        .pipe(
          tap((response: any) => {
            if (response.data) {
              console.log(response);
              this.getRute();
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;
            console.error('Error fetching students:', err);
            this.errorMessage =
              'Error al cargar al actualizar la visita. Por favor, inténtelo de nuevo.';
            // this.reorderableStudentGroups = [];
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;

            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } catch (error) {}
  }

  async setEndTheRoute() {
    // const watchId = false;

    this.isLoading = true;
    this.errorMessage = null;
    try {
      const location = await this.getLocation();

      this.isLoading = true;
      this.errorMessage = null;
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
              this.stopTrackingLocation();
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;
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
