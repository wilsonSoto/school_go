// import { MapsRouteComponent } from './../maps-route/maps-route.component';

import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  Injectable,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  ActionSheetController,
  AlertController,
  ToastController, // Import ToastController for actual toasts
  ActionSheetButton,
} from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

import { Components } from '@ionic/core';
import { ItemReorderEventDetail } from '@ionic/angular';

import { Student } from 'src/app/interfaces/student.interface';
import { StudentGroup } from 'src/app/interfaces/student-group.interface';
import { StudentsService } from 'src/app/services/students.service';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { MapsComponent } from '../maps/maps.component';
import { getCentroid } from 'src/app/shared/utils/geo-utils';

// --- MOCK/CONCEPTUAL GoogleMapsService ---
interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  draggable: boolean;
  label?: string;
  color?: string;
}

interface MarkerDragEvent {
  id: string;
  newPosition: { lat: number; lng: number };
}

@Component({
  standalone: true,
  selector: 'app-reorder-students-map-modal',
  templateUrl: './reorder-students-map-modal.component.html',
  styleUrls: ['./reorder-students-map-modal.component.scss'],
  imports: [CommonModule, IonicModule, MapsComponent],
  providers: [
    // GoogleMapsService,
    StudentsService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReorderStudentsMapModalComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() modal!: Components.IonModal;
  // @Input() activeMap: boolean = false;
  @Input() isActiveAllStudents: boolean= true;
  @Input() studentsForRoute: Student[] = [];
  @Input() studentIdsPickupOrderFormArray: any = [];

  @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;

  reorderableStudentGroups: StudentGroup[] = [];
  isReorderEnabled: boolean = true;
  activeMap: boolean = false;
  isLoadingMap: boolean = true;
  showMapComponent: boolean = true;
  errorMessage: string | null = null;
  myParentCondition = true;
  private markerDragSubscription: Subscription | undefined;
  private studentsSubscription: Subscription | undefined;

  private groupColors: string[] = [
    '#F44336',
    '#2196F3',
    '#4CAF50',
    '#9C27B0',
    '#FF9800',
    '#795548',
    '#E91E63',
    '#00BCD4',
  ];

  markers: any = [];

  constructor(
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController, // INJECT ToastController
    // private mapService: GoogleMapsService,
    private studentsService: StudentsService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    if (
      this.studentIdsPickupOrderFormArray &&
      this.studentIdsPickupOrderFormArray.length > 0
    ) {
      if (this.isActiveAllStudents) {
        this.setReorderStudents();
      } else {
        // console.log(this.studentIdsPickupOrderFormArray,'this.studentIdsPickupOrderFormArray');
        
        this.reorderableStudentGroups = this.studentIdsPickupOrderFormArray;
      }
    } else if (this.studentsForRoute && this.studentsForRoute.length > 0) {
      this.reorderableStudentGroups = [
        {
          id: 'group-general',
          name: 'General (Todos los estudiantes)',
          students: [...this.studentsForRoute],
          point_latitude: 0,
          point_longitude: 0
        },
      ];
    }
    // console.log(this.reorderableStudentGroups, 'this.reorderableStudentGroups');

    this.markers = this.generateMarkersFromGroups(
      this.reorderableStudentGroups
    );
    // console.log(this.markers, 'this.markers');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showMapComponent = true;
    }, 0);
  }

  ngOnDestroy() {
    if (this.markerDragSubscription) {
      this.markerDragSubscription.unsubscribe();
    }
    if (this.studentsSubscription) {
      this.studentsSubscription.unsubscribe();
    }
  }

  async onMarkerMoved(event: { id: string; lat: number; lng: number }) {
  // console.log('🟢 Marcador movido:', event);
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
    // console.log(this.reorderableStudentGroups, 'this.reorderableStudentGroups');

          },
        },
      ],
    });

    await alert.present();
  } else {
    console.warn('Índice fuera de rango');
  }
}


updateGroupOrStudentCoordinates(marker: { id: any; lat: number; lng: number }) {
  for (const group of this.reorderableStudentGroups) {
    // 1. Verifica si es un grupo (coincide con group.id)
    if (group.id === marker.id) {
      group.point_latitude = marker.lat;
      group.point_longitude = marker.lng;
      // console.log(`📍 Coordenadas actualizadas para el grupo: ${group.name}`);
      return;
    }

    // 2. Verifica si es un estudiante (coincide con student.id)
    if (Array.isArray(group.students)) {
      for (const student of group.students) {
        if (student.id === marker.id) {
          student.home_latitude = marker.lat;
          student.home_longitude = marker.lng;
          // console.log(`📍 Coordenadas actualizadas para el estudiante: ${student.name}`);
          return;
        }
      }
    }
  }

  console.warn('❌ No se encontró el grupo o estudiante para actualizar');
}


  generateMarkersFromGroups(
    groups: any[]
  ): { lat: number; lng: number; name: string }[] {
    const markers: { lat: number; lng: number; name: string; id: any }[] = [];

    for (const group of groups) {
      const hasGroupCoords = group.point_latitude && group.point_longitude;

      if (hasGroupCoords) {
        markers.push({
          lat: group.point_latitude,
          lng: group.point_longitude,
          name: group.name,
          id: group.id,
        });
      } else if (Array.isArray(group.students)) {
        for (const student of group.students) {
          const hasStudentCoords =
            student.home_latitude && student.home_longitude;
          if (hasStudentCoords) {
            markers.push({
              lat: student.home_latitude,
              lng: student.home_longitude,
              name: student.name,
              id: student.id,
            });
          }
        }
      }
    }

    return markers;
  }

  setReorderStudents() {
    const selectedStudentIds = this.studentIdsPickupOrderFormArray
      .flatMap((control: any) => {
        const route = control;
        if (Array.isArray(route.students)) {
          return route.students.map((student: any) => student.id);
        }
        return [route.students?.id];
      })
      .filter((id: any) => !!id);

    const filteredStudents = this.studentsForRoute.filter(
      (student) => !selectedStudentIds.includes(student.id)
    );

    // console.log(filteredStudents, 'filteredStudents filteredStudents');
    // console.log(selectedStudentIds, 'selectedStudentIds selectedStudentIds');

    if (
      !this.studentIdsPickupOrderFormArray.some(
        (data: any) => data.id == 'group-general'
      ) ||
      filteredStudents.length > 0
    ) {
      this.reorderableStudentGroups = [
        ...this.studentIdsPickupOrderFormArray,
        {
          id: 'group-general',
          name: 'General (Todos los estudiantes)',
          students: filteredStudents,
        },
      ];
    } else if (
      this.studentIdsPickupOrderFormArray.some(
        (data: any) => data.id == 'group-general'
      ) ||
      filteredStudents.length > 0
    ) {
      this.reorderableStudentGroups = [
        ...this.studentIdsPickupOrderFormArray,
        // {
        //   id: 'group-general',
        //   name: 'General (Todos los estudiantes)',
        //   students: filteredStudents,
        // },
      ];
    }
  }

  getTotalStudents(): number {
    return this.reorderableStudentGroups.reduce(
      (count, group) => count + group.students.length,
      0
    );
  }

  async addGroup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nombre del nuevo grupo',
      inputs: [
        {
          name: 'groupName',
          type: 'text',
          placeholder: 'Ej: Ruta Norte',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Crear',
          handler: (data) => {
            const groupName = data.groupName.trim();
            if (groupName) {
              const newGroupId = `group-${Date.now()}`;
              this.reorderableStudentGroups.push({
                id: newGroupId,
                name: groupName,
                students: [],
                point_latitude: 0,
                point_longitude: 0
              });

              // this.updateMapVisualization();
              this.toastService.presentToast(
                'Nuevo grupo creado: ' + groupName,
                'success'
              );
            } else {
              this.toastService.presentToast(
                'El nombre del grupo no puede estar vacío.',
                'danger'
              );
            }
          },
        },
      ],
    });
    await alert.present();
  }

  removeGroup(groupId: string): void {
    const groupIndex = this.reorderableStudentGroups.findIndex(
      (g) => g.id === groupId
    );
    if (groupIndex > -1) {
      const groupToRemove = this.reorderableStudentGroups[groupIndex];

      if (groupToRemove.id === 'group-general') {
        this.toastService.presentToast(
          'No se puede eliminar el grupo general.',
          'warning'
        );
        return;
      }

      if (groupToRemove.students.length > 0) {
        const generalGroup = this.reorderableStudentGroups.find(
          (g) => g.id === 'group-general'
        );
        if (generalGroup) {
          generalGroup.students.push(...groupToRemove.students);
          console.log(
            `Moved ${groupToRemove.students.length} students from "${groupToRemove.name}" to "General" group.`
          );
          this.toastService.presentToast(
            `Estudiantes de "${groupToRemove.name}" movidos al grupo "General".`,
            'success'
          );
        } else {
          this.toastService.presentToast(
            'No se encontró el grupo "General" para transferir estudiantes.',
            'danger'
          );
          console.warn('Could not find General group to transfer students!');
        }
      }
      this.reorderableStudentGroups.splice(groupIndex, 1);
    }
  }

  handleGroupReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const movedGroup = this.reorderableStudentGroups.splice(
      event.detail.from,
      1
    )[0];
    this.reorderableStudentGroups.splice(event.detail.to, 0, movedGroup);
    event.detail.complete();
  }

  handleStudentReorder(
    event: CustomEvent<ItemReorderEventDetail>,
    groupIndex: number
  ): void {
    const studentsInSourceGroup =
      this.reorderableStudentGroups[groupIndex].students;
    const movedStudent = studentsInSourceGroup.splice(event.detail.from, 1)[0];
    studentsInSourceGroup.splice(event.detail.to, 0, movedStudent);
    event.detail.complete();
  }

  async presentMoveStudentOptions(
    studentToMove: Student,
    currentGroupId: string
  ): Promise<void> {
    const otherGroups = this.reorderableStudentGroups.filter(
      (group) => group.id !== currentGroupId
    );

    if (otherGroups.length === 0) {
      this.toastService.presentToast(
        'No hay otros grupos disponibles para mover este estudiante.',
        'warning'
      );
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: `Mover a ${studentToMove.name} ${studentToMove.last_name} a:`,
      buttons: otherGroups
        .map(
          (group) =>
            ({
              text: group.name,
              handler: () => {
                this.moveStudentToGroup(
                  studentToMove,
                  currentGroupId,
                  group.id
                );
              },
            } as ActionSheetButton)
        )
        .concat([
          {
            text: 'Cancelar',
            role: 'cancel',
          } as ActionSheetButton,
        ]),
    });
    await actionSheet.present();
  }

  moveStudentToGroup11111(
    student: Student,
    fromGroupId: string,
    toGroupId: string
  ): void {
    const fromGroup = this.reorderableStudentGroups.find(
      (g) => g.id === fromGroupId
    );
    const toGroup = this.reorderableStudentGroups.find(
      (g) => g.id === toGroupId
    );
// console.log(fromGroupId,'fromGroupId fromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupIdfromGroupId');
// console.log(toGroup,'toGroup toGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGrouptoGroup');

    if (fromGroup && toGroup) {
      const studentIndex = fromGroup.students.findIndex(
        (s) => s.id === student.id
      );
      if (studentIndex > -1) {
        const [movedStudent] = fromGroup.students.splice(studentIndex, 1);
        toGroup.students.push(movedStudent);
        this.toastService.presentToast(
          `"${movedStudent.name}" movido a "${toGroup.name}"`,
          'success'
        );
      }
    } else {
      this.toastService.presentToast(
        'Error al mover estudiante: grupos no encontrados.',
        'danger'
      );
    }
  }

  moveStudentToGroup(
  student: Student,
  fromGroupId: string,
  toGroupId: string
): void {
  const fromGroup = this.reorderableStudentGroups.find(g => g.id === fromGroupId);
  const toGroup = this.reorderableStudentGroups.find(g => g.id === toGroupId);

  if (!fromGroup || !toGroup) {
    this.toastService.presentToast('Error al mover estudiante: grupos no encontrados.', 'danger');
    return;
  }

  const studentIndex = fromGroup.students.findIndex(s => s.id === student.id);
  if (studentIndex === -1) return;

  const [movedStudent] = fromGroup.students.splice(studentIndex, 1);
  toGroup.students.push(movedStudent);

  // 🧠 Actualizar puntos geográficos si aplica
  if (toGroupId !== 'group-general') {
    // Recalcular centroide
    const wktPoints = toGroup.students
      .filter(s => s.home_latitude && s.home_longitude)
      .map(s => `POINT (${s.home_longitude} ${s.home_latitude})`);

    const centroid = getCentroid(wktPoints);
    if (centroid) {
      toGroup.point_latitude = centroid.lat;
      toGroup.point_longitude = centroid.lon;
    }
  }

  if (fromGroupId !== 'group-general' && fromGroup.students.length > 0) {
    // Recalcular centroide del grupo origen si aún tiene estudiantes
    const wktPoints = fromGroup.students
      .filter(s => s.home_latitude && s.home_longitude)
      .map(s => `POINT (${s.home_longitude} ${s.home_latitude})`);

    const centroid = getCentroid(wktPoints);
    if (centroid) {
      fromGroup.point_latitude = centroid.lat;
      fromGroup.point_longitude = centroid.lon;
    }
  } else if (fromGroupId !== 'group-general' && fromGroup.students.length === 0) {
    // Si quedó vacío, borra punto
    fromGroup.point_latitude = 0;
    fromGroup.point_longitude = 0;
  }

  this.toastService.presentToast(
    `"${movedStudent.name}" movido a "${toGroup.name}"`,
    'success'
  );
}

  dismissModal(action: 'cancel' | 'save' = 'cancel'): void {
    if (action === 'cancel') {
      this.modal.dismiss({ action: 'cancel' });
    } else {
      const finalOrderedStudents: Student[] = [];
      // this.reorderableStudentGroups.forEach(group => {
      //   group.students.forEach(student => {
      //     finalOrderedStudents.push({
      //       id: student.id,
      //       home_latitude: student.home_latitude,
      //       home_longitude: student.home_longitude,
      //       name: student.name,
      //       last_name: student.last_name,
      //       address: student.address
      //     });
      //   });
      // });

      this.modal.dismiss({
        action: 'save',
        reorderedStudentsWithCoords: this.reorderableStudentGroups,
      });
    }
  }

  onSaveOrderAndLocations(): void {
    this.dismissModal('save');
  }

  toggleReorder(): void {
    this.isReorderEnabled = !this.isReorderEnabled;
  }
}
