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
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StudentsService } from 'src/app/services/students.service';
import { Driver } from 'src/app/interfaces/driver.interface'; // Import Driver interface
import { Bus } from 'src/app/interfaces/bus.interface';     // Import Bus interface
import { RouteService } from 'src/app/services/route.service';

import { Subject, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-add-route',
  templateUrl: 'add-route.component.html',
  styleUrls: ['add-route.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AddRouteComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    private routeService: RouteService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private toastService: ToastService
  ) {}

  @Input() action: string = '';
  @Input() partner_id: any = null;

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

  colorCalendar = 'dark';
  date = new Date();
  route_id: any = null;
  // currentDriver: any = null // <<< Remove this or make it Driver | null
  selectedDriver: Driver | null = null; // New property to store the full driver object
  selectedBus: Bus | null = null;     // New property to store the full bus object

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
      student_ids_pickup_order: this.fb.array([])
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
      const dataSchedule = schedules.map((sc: any) =>{
      return {
        session_start_time: sc.session_start_time.label,
        session_end_time: sc.session_end_time.label,
        day: sc.day.value,
        name: sc.day.label,
        checked: true,
      }
    })

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
        this.ruteForm.patchValue({
          schedules: data.selectedWeekDays.days,
        });
// console.log(data.selectedWeekDays.days,'data.selectedWeekDays.days data.selectedWeekDays.days');

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
      const newSelectedStudentIds: string[] = data.selectedStudentIds;

      // Clear existing student IDs in the form array
      while (this.studentIdsFormArray.length !== 0) {
        this.studentIdsFormArray.removeAt(0);
      }

      // Add the newly selected student IDs
      newSelectedStudentIds.forEach(id => {
        this.studentIdsFormArray.push(this.fb.control(id));
      });

      // console.log('Selected student IDs in AddRouteComponent:', this.ruteForm.get('student_ids')?.value);


    } else {
      // console.log('Student selection cancelled or no students selected.');
    }
  }

    // <--- FIX: This function was previously outside the class. Moved it inside.
  getStudentName(id: string): string {
    const student = this.allStudents.find(s => s.id === id);

    // const student = this.selectedStudentsForRoute.find(s => s.id === id);
    return student ? `${student.name} ${student.last_name}` : 'Unknown Student';
  }
  // NEW HELPER METHOD FOR COORDINATES
  getStudentCoordinates(studentId: string): { home_latitude: number | undefined; home_longitude: number | undefined } {
    const student = this.selectedStudentsForRoute.find(s => s.id === studentId) ?? {home_latitude: 0, home_longitude: 0};
    return {
      home_latitude: student?.home_latitude ,
      home_longitude: student?.home_longitude
    };
  }
  // You need to fetch the driver and bus details if the route is being edited.
  // Assuming your getRute() returns the full route object including driver and bus IDs
  // and you have services to get the full objects by ID.
  getRute() {

     this.routeSubscription = this.routeService.getRoute(this.route_id).pipe(
      tap((response: any) => {
          if (response.data) {
          const routeData = response.data.school_route;
          if (routeData?.schedules) {
            this.setSchedules(routeData.schedules);
          }
          this.ruteForm.patchValue({
            name: routeData.name,
            driverId: routeData?.school_driver?.id, // Assuming your backend provides these
            busId: routeData?.school_bus?.id,       // Assuming your backend provides these
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
            const students =routeData.students.map((st: any) => {

              st.checked = true
              this.studentIdsFormArray.push(this.fb.control(st))
              return {
                ...st
              }

            });
          const allStudents = [... routeData.pending_students, ...students]

            // You might need to fetch full student objects based on these IDs if you plan to display them
            this.loadStudents(allStudents);
          }

          if (routeData.route_points && Array.isArray(routeData.route_points)) {
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
              this.studentIdsPickupOrderFormArray.push(this.fb.control(route));
              this.selectedStudentsForRoute.push(route);
            }

            });
          }
// console.log(this.studentIdsPickupOrderFormArray,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');
// console.log(this.selectedStudentsForRoute,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');

        }
      }),
      catchError(err => {
        // console.error('Error fetching students:', err);
        this.errorMessage = 'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
        // this.reorderableStudentGroups = [];
        return of([]);
      }),
      finalize(() => {
        setTimeout(() => {
        }, 0);
      })
    ).subscribe();


//     this.routeService.getRoute(this.route_id).subscribe({
//       next: (response: any) => {
//         if (response.data) {
//           const routeData = response.data.school_route;
//           if (routeData?.schedules) {
//             this.setSchedules(routeData.schedules);
//           }
//           this.ruteForm.patchValue({
//             name: routeData.name,
//             driverId: routeData?.school_driver?.id, // Assuming your backend provides these
//             busId: routeData?.school_bus?.id,       // Assuming your backend provides these
//           });


//           // Fetch full driver and bus objects if only IDs are returned
//           if (routeData.school_driver?.id) {
//             this.selectedDriver = routeData.school_driver;

//           }
//           if (routeData.school_bus?.id) {
//             this.selectedBus = routeData.school_bus;

//           }

//           // Handle student_ids and student_ids_pickup_order if they exist in the route data
//           if (routeData.students && Array.isArray(routeData.students)) {
//             this.studentIdsFormArray.clear();
//             routeData.students.forEach((id: string) => this.studentIdsFormArray.push(this.fb.control(id)));
//             // You might need to fetch full student objects based on these IDs if you plan to display them
//             this.loadStudents(routeData.students);
//           }

//           if (routeData.route_points && Array.isArray(routeData.route_points)) {
//             this.studentIdsPickupOrderFormArray.clear();
//             routeData.route_points.forEach((route: any) => {
              // console.log(route,'/////////////////////852');
              // console.log(route.students,'////students/////////////////852');

//               if ( route.students.name || route.students.length > 0) {
                // console.log('//entreeeeeeeeeeeeeeeee///////////////////852');
//                 this.studentIdsPickupOrderFormArray.push(this.fb.control(route))
//                 this.selectedStudentsForRoute.push(route)

//               }
//             });
//           }
// console.log(this.studentIdsPickupOrderFormArray,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');
// console.log(this.selectedStudentsForRoute,'this.studentIdsPickupOrderFormArray this.studentIdsPickupOrderFormArray 3............');

//         }
//       },
//       error: (err: any) => {
//         const errorMessage =
//           err.error.error.message ||
//           err.error.error ||
//           err?.message ||
//           'Error desconocido';
//         this.toastService.presentToast(errorMessage);
//       },
//     });
  }

  // Helper to fetch full student objects based on IDs (if your API gives only IDs initially)
  private fetchSelectedStudentsDetails(studentIds: string[]): void {
    // Assuming your StudentsService has a method like `getStudentsByIds`
    // If your `getStudents()` already returns all students, filter them:
    this.studentsService.getStudents().pipe(
        map((res: any) => {
            const allFetchedStudents: Student[] = res.data.student;
            return allFetchedStudents.filter(s => studentIds.includes(s.id));
        }),
        tap(filteredStudents => {
            this.selectedStudentsForRoute = filteredStudents;
            this.allStudents = filteredStudents; // Ensure allStudents also has the full objects
        }),
        catchError(err => {
            // console.error('Error fetching selected student details:', err);
            return of([]);
        })
    ).subscribe();
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
        busId: this.ruteForm.value.busId,       // Include busId
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
        // Pass the *full* currently selected driver/bus objects if you have them
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
      const selectedBus: Bus | null = data.selectedBus;         // Expecting full object

      // console.log('Selected Driver:', selectedDriver);
      // console.log('Selected Bus:', selectedBus);

      this.selectedDriver = selectedDriver;
      this.selectedBus = selectedBus;

      // Update form controls with just their IDs
      this.ruteForm.patchValue({
        driverId: selectedDriver ? selectedDriver.id : null,
        busId: selectedBus ? selectedBus.id : null,
      });

      this.toastService.presentToast('Chofer y Autobús seleccionados', 'success');

    } else {
      // console.log('Driver/Bus selection cancelled.');
    }
  }

  // ... (openStudentsSelectionModal is fine)

  loadStudents(allFetchedStudents: Student[]): void {
    this.isLoadingMap = true;
    this.errorMessage = null;
// console.log(allFetchedStudents, 'allFetchedStudents allFetchedStudents');

    // Fetch *all* students first
    // this.studentsService.getAllStudents().pipe(
    //   tap((res: any) => {
    //     const allFetchedStudents: Student[] = res.data.students;

        // Filter `allFetchedStudents` to only include those in `studentIdsFormArray`
        // And ensure they have `home_latitude` and `home_longitude` if missing.
        this.allStudents = allFetchedStudents
        // .filter(student =>
          // this.studentIdsFormArray.value.includes(student.id)
        // )
        .map(student => ({

          ...student,
          home_latitude: student.home_latitude ?? 0, // Default to 0 if null/undefined
          home_longitude: student.home_longitude ?? 0, // Default to 0 if null/undefined
        }));

// console.log(this.ruteForm, 'this.ruteForm this.ruteForm');
// console.log(this.allStudents, 'this.allStudents this.allStudents');
// console.log(this.studentIdsFormArray, 'this.studentIdsFormArray this.studentIdsFormArray');

        // if (this.allStudents.length > 0) {
        //   this.openReorderStudentsMapModal();
        // } else {
        //   this.toastService.presentToast('No hay estudiantes seleccionados con coordenadas válidas para mostrar en el mapa.', 'warning');
        // }
    //   }),
    //   catchError(err => {
        // console.error('Error fetching students:', err);
    //     this.errorMessage = 'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
    //     this.toastService.presentToast(this.errorMessage, 'danger');
    //     return of([]);
    //   }),
    //   finalize(() => {
    //     this.isLoadingMap = false;
    //   })
    // ).subscribe();
  }


  async openReorderStudentsMapModal() {
    if (this.allStudents.length === 0) { // Check this.allStudents (filtered and prepared)
      // console.warn('No students prepared for reordering.');
      this.toastService.presentToast('No hay estudiantes para reordenar en el mapa. Seleccione estudiantes y asegúrese de que tengan coordenadas.', 'warning');
      return;
    }

    const modal = await this.modalController.create({
      component: ReorderStudentsMapModalComponent,
      componentProps: {
        studentsForRoute: [...this.allStudents], // Pass the prepared student objects
        studentIdsPickupOrderFormArray: [...this.studentIdsPickupOrderFormArray.value], // Pass the prepared student objects
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: ['full-screen-modal']
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.action === 'save' && data.reorderedStudentsWithCoords) {
      const reorderedStudentsWithCoords: Student[] = data.reorderedStudentsWithCoords;
      this.studentIdsPickupOrderFormArray.clear();

reorderedStudentsWithCoords.forEach((group: any) => {
  const studentObjects = group.students.map((student: any) => ({
    id: student.id,
    name: student.name,
    last_name: student.last_name,
    home_latitude: student.home_latitude,
    home_longitude: student.home_longitude
  }));

  this.studentIdsPickupOrderFormArray.push(this.fb.control({
    name: group.name,
    id: group.id,
    students: studentObjects
  }));

      this.selectedStudentsForRoute =      studentObjects
; // Update the list of full student objects with the new order AND updated coordinates

});

// console.log(reorderedStudentsWithCoords,'reorderedStudentsWithCoords');

      // this.selectedStudentsForRoute = reorderedStudentsWithCoords; // Update the list of full student objects with the new order AND updated coordinates

      // console.log('Reordered student IDs in AddRouteComponent  studentIdsPickupOrderFormArray:', this.studentIdsPickupOrderFormArray.value);
      // console.log('Updated student coordinates:', this.selectedStudentsForRoute.map((s: any) => ({id: s.id, lat: s.home_latitude, lng: s.home_longitude})));

    } else {
      // console.log('Student reordering and map adjustment cancelled.');
    }
  }

}

interface RouteSchedule {
  session_start_time: string;
  session_end_time: string;
  day: string;
  name: string;
  checked: boolean;
}
