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
import { IonPopover, ModalController } from '@ionic/angular';
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
import { StudentsService } from 'src/app/services/students.service';
import { Driver } from 'src/app/interfaces/driver.interface'; // Import Driver interface
import { Bus } from 'src/app/interfaces/bus.interface'; // Import Bus interface
import { RouteService } from 'src/app/services/route.service';

import { RouteTrackingService } from 'src/app/services/route-tracking.service';
import {
  catchError,
  finalize,
  of,
  Subscription,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
@Component({
  standalone: true,
  selector: 'app-add-route',
  templateUrl: 'add-route.component.html',
  styleUrls: ['add-route.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class AddRouteComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    private routeService: RouteService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private routeTrackingService: RouteTrackingService,
    private toastService: ToastService
  ) {}

  action: string = '';
  @Input() partner_id: any = null;
  private componentDestroyed$ = new Subject<void>();

  @ViewChild('timePopover') timePopover!: IonPopover;

  showCalendar = false;
  selectedDays: any[] = [];
  selectedDayForPopover: any = null;
  isPopoverOpen: boolean = false;
  selectedStudents: Student[] = [];
  selectedStudentsForRoute: Student[] = [];
  allStudents: any[] = [];

  isLoadingMap: boolean = true;
  errorMessage: string | null = null;
  isActiveAllStudents: boolean = true;
  colorCalendar = 'dark';
  date = new Date();
  route_id: any = null;
  // currentDriver: any = null // <<< Remove this or make it Driver | null
  selectedDriver: Driver | null = null; // New property to store the full driver object
  selectedBus: Bus | null = null; // New property to store the full bus object

  get defaultHref(): string {
    let href = '/tabs';
    return href;
  }
  private routeSubscription: Subscription | undefined;

  ruteForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.route_id = this.route.snapshot.paramMap.get('routeId');
    // console.log(this.route_id, 'id -------------------------------');
    this.route.queryParams
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter((params: any) => params.action !== undefined),
        map((params: any) => params.action)
      )
      .subscribe((action) => {
        this.action = action;
      });

    if (this.route_id) {
      this.getRute();
    }
  }

  get schedulesFormArray(): FormArray {
    return this.ruteForm.get('schedules') as FormArray;
  }

  get schedulesFormDays(): any {
    const route = this.selectedDays;
    const routeName = route.map((route: any) => route.name);
    return routeName.toString();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  initForm(): void {
    this.ruteForm = this.fb.group({
      name: ['', Validators.required],
      schedules: this.fb.array([], Validators.required),
      driverId: [null, Validators.required],
      busId: [null, Validators.required],
      student_ids: this.fb.array([]),
      student_ids_pickup_order: this.fb.array([]),
    });

    const initialSchedules: RouteSchedule[] = [
      {
        session_start_time: '',
        session_end_time: '',
        day: '',
        name: '',
        checked: false,
      },
    ];
    initialSchedules.forEach((schedule) => this.addSchedule(schedule));
  }

  get studentIdsFormArray(): FormArray {
    return this.ruteForm.get('student_ids') as FormArray;
  }

  get studentIdsPickupOrderFormArray(): FormArray {
    return this.ruteForm.get('student_ids_pickup_order') as FormArray;
  }

  createScheduleGroup(schedule: RouteSchedule): FormGroup {
    return this.fb.group({
      session_start_time: [schedule.session_start_time, Validators.required],
      session_end_time: [schedule.session_end_time, Validators.required],
      day: [schedule.day, Validators.required],
      name: [schedule.name, Validators.required],
      checked: [schedule.checked, Validators.required],
    });
  }

  addSchedule(schedule?: any): void {
    const newSchedule = schedule || {
      session_start_time: '',
      session_end_time: '',
      day: '',
      name: '',
      checked: false,
    };
    this.schedulesFormArray.push(this.createScheduleGroup(newSchedule));
  }

  removeSchedule(index: number): void {
    this.schedulesFormArray.removeAt(index);
  }

  setSchedules(schedules: RouteSchedule[]): void {
    this.schedulesFormArray.clear();
    const dataSchedule = schedules.map((sc: any) => {
      return {
        session_start_time: sc.session_start_time.label,
        session_end_time: sc.session_end_time.label,
        day: sc.day.value,
        name: sc.day.label,
        checked: true,
      };
    });

    this.selectedDays = dataSchedule;

    dataSchedule.forEach((schedule) => this.addSchedule(schedule));
  }

  async handleOpenSelectWeekDayToTimmeModal() {
    try {
      const modal = await this.modalController.create({
        component: SelectWeekDayComponent,
        componentProps: {
          currentSchedules: this.selectedDays,
        },
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        cssClass: ['loading-truck-options-sheet-modal'],
      });
      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (!data) {
        // console.log('Modal dismissed without data.');
        return;
      }

      if (
        data.selectedWeekDays.days?.length > 0 &&
        Array.isArray(data.selectedWeekDays?.days)
      ) {
        this.ruteForm.patchValue({
          schedules: [],
        });
        this.selectedDays = data.selectedWeekDays.days;
        // this.ruteForm.patchValue({
        //   schedules: data.selectedWeekDays.days,
        // });
    this.ruteForm.setControl('schedules', this.fb.array(data.selectedWeekDays.days));

        // this.ruteForm.value.schedules.push(
        //   this.fb.control({
        //     id: 'group-general',
        //     name: 'General (Todos los estudiantes)',
        //     students: dataPickUp,
        //   })
        // );
        console.log(data.selectedWeekDays, 'data.selectedWeekDays  data.selectedWeekDays====================');
        
        // console.log(data.selectedWeekDays.days,'data.selectedWeekDays.days data.selectedWeekDays.days');
        if (this.action == 'edit') {
          this.setSelectDriver();
        }
        this.toastService.presentToast(
          'Horarios de ruta actualizados!',
          'custom-success-toast'
        );
      } else {
        // console.warn('Modal dismissed without valid schedule data.');
      }
    } catch (error: any) {
      // console.error('Error opening or dismissing modal:', error);
      this.toastService.presentToast(
        'Error al abrir el selector de días.',
        'custom-error-toast'
      );
    }
  }

  // This method will now be for opening the student selection modal
  async openStudentsSelectionModal() {
    const modal = await this.modalController.create({
      component: SelectStudentsModalComponent,
      componentProps: {
        // Pass currently selected student IDs to the modal for pre-selection
        currentStudentIds: this.allStudents,
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'select' && data.selectedStudentIds) {
      const newSelectedStudentIds: any[] = data.selectedStudentIds;

      // Clear existing student IDs in the form array
      while (this.studentIdsFormArray.length !== 0) {
        this.studentIdsFormArray.removeAt(0);
      }

      // Add the newly selected student IDs
      newSelectedStudentIds.forEach((id) => {
        this.studentIdsFormArray.push(this.fb.control(id));
      });
      if (this.action == 'edit') {
        this.setSelectStudents();
        this.studentIdsFormArray.clear();
        this.studentIdsPickupOrderFormArray.clear();
console.log(newSelectedStudentIds, 'newSelectedStudentIdsnewSelectedStudentIdsv ...........................');
console.log(this.studentIdsPickupOrderFormArray, 'studentIdsPickupOrderFormArray ..........studentIdsPickupOrderFormArray.................');
this.setReorderStudentsUpdate(newSelectedStudentIds);

        // this.loadStudents(newSelectedStudentIds);
        newSelectedStudentIds.forEach((st: any) => {
          // st.checked = true;
          this.studentIdsFormArray.push(this.fb.control(st));
          // return {
          //   ...st,
          // };
          // this.studentIdsPickupOrderFormArray.push(
          //   this.fb.control({
          //     name: group.name,
          //     id: group.id,
          //     students: studentObjects,
          //   })
          // );
        });


        
      }
    } else {
      // console.log('Student selection cancelled or no students selected.');
    }
  }

  // <--- FIX: This function was previously outside the class. Moved it inside.
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
  // You need to fetch the driver and bus details if the route is being edited.
  // Assuming your getRute() returns the full route object including driver and bus IDs
  // and you have services to get the full objects by ID.
  getRute() {
    this.routeSubscription = this.routeService
      .getRoute(this.route_id)
      .pipe(
        tap((response: any) => {
          if (response.data) {
            const routeData = response.data.school_route;
            if (routeData?.schedules) {
              this.setSchedules(routeData.schedules);
            }
            this.ruteForm.patchValue({
              name: routeData.name,
              driverId: routeData?.school_driver?.id, // Assuming your backend provides these
              busId: routeData?.school_bus?.id, // Assuming your backend provides these
            });

            // Fetch full driver and bus objects if only IDs are returned
            if (routeData.school_driver?.id) {
              this.selectedDriver = routeData.school_driver;
            }
            if (routeData.school_bus?.id) {
              this.selectedBus = routeData.school_bus;
            }

            // Handle student_ids and student_ids_pickup_order if they exist in the route data
            if (routeData.students && Array.isArray(routeData.students)) {
              this.studentIdsFormArray.clear();
              const students = routeData.students.map((st: any) => {
                st.checked = true;
                this.studentIdsFormArray.push(this.fb.control(st));
                return {
                  ...st,
                };
              });
              // const allStudents = [ ...students]
              const allStudents = [...routeData.pending_students, ...students];

              // You might need to fetch full student objects based on these IDs if you plan to display them
              this.loadStudents(allStudents);
            }

            if (
              routeData.route_points &&
              Array.isArray(routeData.route_points)
            ) {
              this.studentIdsPickupOrderFormArray.clear();
              routeData.route_points.forEach((route: any) => {
                // console.log(route,'/////////////////////852');
                // console.log(route.students,'////students/////////////////852');

                // Asegurarte de que route.students sea siempre un array
                if (!Array.isArray(route.students)) {
                  route.students = [route.students];
                }

                // Luego verifica si hay estudiantes
                if (route.students.length > 0) {
                  // console.log('//entreeeeeeeeeeeeeeeee///////////////////852');
                  this.studentIdsPickupOrderFormArray.push(
                    this.fb.control(route)
                  );
                  this.selectedStudentsForRoute.push(route);
                }
              });
            }
            // console.log(this.studentIdsPickupOrderFormArray,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');
            // console.log(this.selectedStudentsForRoute,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');
            this.setReorderStudents(this.studentIdsPickupOrderFormArray.value);
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
  }

  setReorderStudents(dataPickUp: any) {
    const selectedStudentIds = dataPickUp
      .flatMap((control: any) => {
        const route = control;
        if (Array.isArray(route.students)) {
          return route.students.map((student: any) => student.id);
        }
        return [route.students?.id];
      })
      .filter((id: any) => !!id);

    const filteredStudents = this.allStudents.filter(
      (student) => !selectedStudentIds.includes(student.id)
    );

    this.studentIdsPickupOrderFormArray.push(
      this.fb.control({
        id: 'group-general',
        name: 'General (Todos los estudiantes)',
        students: filteredStudents,
      })
    );
  }

  setReorderStudentsUpdate(dataPickUp: any) {
    this.ruteForm.setControl('studentIdsPickupOrderFormArray', this.fb.array([]));
console.log(this.studentIdsPickupOrderFormArray);
    this.isActiveAllStudents =false;
    this.studentIdsPickupOrderFormArray.push(
      this.fb.control({
        id: 'group-general',
        name: 'General (Todos los estudiantes)',
        students: dataPickUp,
      })
    );
  }


  async onSubmit() {
    this.ruteForm.markAllAsTouched();

    this.schedulesFormArray.controls.forEach((group: any, index) => {
      // console.log(`Schedule Group ${index} Valid?`, group.valid);
      Object.keys(group.controls).forEach((key) => {
        const control = group.get(key);
        if (control && control.invalid) {
          // console.log(`  Control ${key} invalid. Errors:`, control.errors);
        }
      });
    });

    if (this.ruteForm.valid) {
      const userData = JSON.parse(localStorage.getItem('userData') ?? '{}');

      const data = {
        name: this.ruteForm.value.name,
        schedules: this.ruteForm.value.schedules,
        partner_id: this.partner_id,
        company_id: userData.company.id ?? null,
        action: this.action,
        driverId: this.ruteForm.value.driverId, // Include driverId
        busId: this.ruteForm.value.busId, // Include busId
        student_ids: this.ruteForm.value.student_ids, // Include selected student IDs
        student_ids_pickup_order: this.ruteForm.value.student_ids_pickup_order, // Include pickup order
      };

      const observableResponse = await this.routeService.postParent(data);

      observableResponse.subscribe({
        next: (response: any) => {
          const msm = this.action == 'edit' ? 'Ruta Editada' : 'Ruta Agregada';
          this.toastService.presentToast(msm, 'custom-success-toast');
          // Optionally, dismiss modal or navigate
        },
        error: (err: any) => {
          const errorMessage =
            err.error.error.message ||
            err.error.error ||
            err?.message ||
            'Error desconocido al agregar/editar ruta';
          this.toastService.presentToast(errorMessage);
        },
      });
    } else {
      // console.log('Formulario inválido. Errores por campo:');
      Object.keys(this.ruteForm.controls).forEach((key) => {
        const control = this.ruteForm.get(key);
        if (control && control.invalid) {
          // console.log(`Campo '${key}' es inválido. Errores:`, control.errors);
        }
      });
    }
  }

  // ... (handleOpenSelectWeekDayToTimmeModal, getStudentName, getStudentCoordinates are fine)

  async openDriverBusSelectionModal() {
    const modal = await this.modalController.create({
      component: SelectDriverBusComponent,
      componentProps: {
        initialDriverId: this.ruteForm.get('driverId')?.value,
        initialBusId: this.ruteForm.get('busId')?.value,
        initialSelectedDriver: this.selectedDriver,
        initialSelectedBus: this.selectedBus,
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: ['select-driver-bus-modal'],
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'select') {
      const selectedDriver: Driver | null = data.selectedDriver; // Expecting full object
      const selectedBus: Bus | null = data.selectedBus; // Expecting full object

      this.selectedDriver = selectedDriver;
      this.selectedBus = selectedBus;

      this.ruteForm.patchValue({
        driverId: selectedDriver ? selectedDriver : null,
        busId: selectedBus ? selectedBus : null,
      });

      if (this.action == 'edit') {
        this.setSelectDriver();
      }
      this.toastService.presentToast(
        'Chofer y Autobús seleccionados',
        'success'
      );
    } else {
      // console.log('Driver/Bus selection cancelled.');
    }
  }

  // ... (openStudentsSelectionModal is fine)

  loadStudents(allFetchedStudents: Student[]): void {
    // console.log(allFetchedStudents,'allFetchedStudents allFetchedStudents');
    
    this.isLoadingMap = true;
    this.errorMessage = null;
    this.allStudents = allFetchedStudents.map((student) => ({
      ...student,
      home_latitude: student.home_latitude ?? 0, // Default to 0 if null/undefined
      home_longitude: student.home_longitude ?? 0, // Default to 0 if null/undefined
    }));
  }

  async openReorderStudentsMapModal() {
    if (this.allStudents.length === 0) {
      // Check this.allStudents (filtered and prepared)
      // console.warn('No students prepared for reordering.');
      this.toastService.presentToast(
        'No hay estudiantes para reordenar en el mapa. Seleccione estudiantes y asegúrese de que tengan coordenadas.',
        'warning'
      );
      return;
    }

    const modal = await this.modalController.create({
      component: ReorderStudentsMapModalComponent,
      componentProps: {
        isActiveAllStudents: this.isActiveAllStudents, // Pass the prepared student objects
        studentsForRoute: [...this.allStudents], // Pass the prepared student objects
        studentIdsPickupOrderFormArray: [
          ...this.studentIdsPickupOrderFormArray.value,
        ], // Pass the prepared student objects
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      // cssClass: ['full-screen-modal']
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'save' && data.reorderedStudentsWithCoords) {
      const reorderedStudentsWithCoords: Student[] =
        data.reorderedStudentsWithCoords;
      this.studentIdsPickupOrderFormArray.clear();

      reorderedStudentsWithCoords.forEach((group: any) => {
        const studentObjects = group.students.map((student: any) => ({
          id: student.id,
          name: student.name,
          last_name: student.last_name,
          home_latitude: student.home_latitude,
          home_longitude: student.home_longitude,
        }));

        this.studentIdsPickupOrderFormArray.push(
          this.fb.control({
            name: group.name,
            id: group.id,
            students: studentObjects,
          })
        );

        this.selectedStudentsForRoute = studentObjects;
        this.setPointsInRoute();
      });
    }
  }

  //request

  async setSelectDriver() {
    try {
      console.log(
        this.ruteForm.value,
        'this.ruteForm.value this.ruteForm.value'
      );

      this.routeTrackingService
        .updateRoute(this.route_id, this.ruteForm.value)
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

  async setSelectStudents() {
    try {
      // console.log(
      //   this.ruteForm.value,
      //   'this.ruteForm.value this.ruteForm.value'
      // );
      const student_ids = this.ruteForm.value.student_ids.map(
        (student: any) => student.id ?? student
      );
      this.routeTrackingService
        .updateStudentsInRoute(this.route_id, student_ids)
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

  setPoints() {
   let visitCounter = 1;

    const route_points = this.studentIdsPickupOrderFormArray.value.flatMap(
      (group: any) => {
        const validStudents = group.students.filter(
          (s: any) => s.home_latitude !== 0 && s.home_longitude !== 0
        );

        if (group.id === 'group-general') {
          // Cada estudiante es un punto individual
          return validStudents.map((student: any) => ({
            name: student.name,
            visit_order: visitCounter++,
            point_latitude: student.home_latitude,
            point_longitude: student.home_longitude,
            is_student_point: true,
            students: [student.id],
          }));
        } else if (validStudents.length > 0) {
          // Grupo agrupado: un solo punto por grupo
          const latSum = validStudents.reduce(
            (sum: any, s: any) => sum + s.home_latitude,
            0
          );
          const lngSum = validStudents.reduce(
            (sum: any, s: any) => sum + s.home_longitude,
            0
          );
          const avgLat = latSum / validStudents.length;
          const avgLng = lngSum / validStudents.length;

          return [
            {
              name: group.name,
              visit_order: visitCounter++,
              point_latitude: avgLat,
              point_longitude: avgLng,
              is_student_point: true,
              students: validStudents.map((s: any) => s.id),
            },
          ];
        }

        return []; // Si no hay estudiantes válidos
      }
    );

    // console.log(route_points);
    return route_points;
  }

  async setPointsInRoute() {
    try {
      // console.log(
      //   this.selectedStudentsForRoute,
      //   'this.selectedStudentsForRoute this.selectedStudentsForRoute'
      // );
      // console.log(
      //   this.studentIdsPickupOrderFormArray,
      //   ' this.studentIdsPickupOrderFormArray  this.studentIdsPickupOrderFormArray'
      // );
      const data = this.setPoints();
      // console.log(data, '///////2/2/2/2/2/2//2/2/2/2/2/2/2');

      this.routeTrackingService
        .updatePointsInRoute(this.route_id, data)
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
