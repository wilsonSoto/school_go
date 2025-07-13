import { MapsComponent } from './../maps-route/maps-route.component';

import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  Injectable,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  ActionSheetController,
  AlertController,
  ToastController, // Import ToastController for actual toasts
  ActionSheetButton
} from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

import { Components } from '@ionic/core';
import { ItemReorderEventDetail } from '@ionic/angular';

import { Student } from 'src/app/interfaces/student.interface';
import { StudentGroup } from 'src/app/interfaces/student-group.interface';
import { StudentsService } from 'src/app/services/students.service';
import { Subject, Subscription } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
// import { MapsComponent } from '../maps/maps.component';

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

// @Injectable({ providedIn: 'root' })
// class GoogleMapsService {
//   private map: any;
//   private markers: Map<string, any> = new Map();

//   markerDragged = new Subject<MarkerDragEvent>();

//   initMap(mapElement: HTMLElement, center: { lat: number; lng: number }, zoom: number = 14): void {
//     console.log('Mock: Initializing map on element:', mapElement);
//   }

//   addMarker(markerData: MapMarker): void {
//     console.log(`Mock: Adding marker for ${markerData.title} at (${markerData.position.lat}, ${markerData.position.lng})`);
//   }

//   removeMarker(id: string): void {
//     console.log(`Mock: Removing marker for ID: ${id}`);
//   }

//   clearMarkers(): void {
//     console.log('Mock: Clearing all markers');
//   }

//   updateMarkerPosition(id: string, newPosition: { lat: number; lng: number }): void {
//     console.log(`Mock: Updating marker ${id} position to (${newPosition.lat}, ${newPosition.lng})`);
//   }

//   updateMarkerLabel(id: string, label: string): void {
//     console.log(`Mock: Updating marker ${id} label to ${label}`);
//   }

//   centerMap(position: { lat: number; lng: number }, zoom?: number): void {
//     console.log(`Mock: Centering map on (${position.lat}, ${position.lng})`);
//   }
// }
// --- END MOCK/CONCEPTUAL GoogleMapsService ---


@Component({
  standalone: true,
  selector: 'app-reorder-students-map-modal',
  templateUrl: './reorder-students-map-modal.component.html',
  styleUrls: ['./reorder-students-map-modal.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    MapsComponent
],
  providers: [
    // GoogleMapsService,
    StudentsService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReorderStudentsMapModalComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() modal!: Components.IonModal;
  @Input() studentsForRoute: Student[] = [];
  @Input() studentIdsPickupOrderFormArray: any[] = [];

  @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;

  reorderableStudentGroups: StudentGroup[] = [];
  isReorderEnabled: boolean = true;
  isLoadingMap: boolean = true;
  showMapComponent: boolean = true;
  errorMessage: string | null = null;
myParentCondition = true;
  private markerDragSubscription: Subscription | undefined;
  private studentsSubscription: Subscription | undefined;

  private groupColors: string[] = ['#F44336', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#795548', '#E91E63', '#00BCD4'];

  constructor(
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController, // INJECT ToastController
    // private mapService: GoogleMapsService,
    private studentsService: StudentsService,
    private toastService: ToastService

  ) {}

  ngOnInit() {
    console.log(this.studentIdsPickupOrderFormArray,'studentIdsPickupOrderFormArray');
    console.log(this.studentsForRoute,'studentsForRoute');

    if (this.studentIdsPickupOrderFormArray && this.studentIdsPickupOrderFormArray.length > 0) {
       this.reorderableStudentGroups =  [...this.studentIdsPickupOrderFormArray]
    } else if (this.studentsForRoute && this.studentsForRoute.length > 0) {
      this.reorderableStudentGroups = [{
        id: 'group-general',
        name: 'General (Todos los estudiantes)',
        students: [...this.studentsForRoute]
      }];
    }
    // else {
    //   this.loadStudents();
    // }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showMapComponent = true
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

  getTotalStudents(): number {
    return this.reorderableStudentGroups.reduce((count, group) => count + group.students.length, 0);
  }

  // loadStudents(): void {
  //   this.isLoadingMap = true;
  //   this.errorMessage = null;

  //   this.studentsSubscription = this.studentsService.getAllStudents().pipe(
  //     tap((res: any) => {
  //       if (res && res.data && res.data.students) {
  //         this.reorderableStudentGroups = [{
  //           id: 'group-general',
  //           name: 'General (Todos los estudiantes)',
  //           students: [...res.data.students]
  //         }];
  //       } else {
  //         this.errorMessage = 'No se encontraron datos de estudiantes.';
  //         this.reorderableStudentGroups = [];
  //       }
  //     }),
  //     catchError(err => {
  //       console.error('Error fetching students:', err);
  //       this.errorMessage = 'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
  //       this.reorderableStudentGroups = [];
  //       return of([]);
  //     }),
  //     finalize(() => {
  //       setTimeout(() => {
  //       }, 0);
  //     })
  //   ).subscribe();
  // }

  private getGroupColor(groupId: string): string {
    const hash = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.groupColors[hash % this.groupColors.length];
  }

  // --- Group Management ---
  async addGroup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nombre del nuevo grupo',
      inputs: [
        {
          name: 'groupName',
          type: 'text',
          placeholder: 'Ej: Ruta Norte'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Crear',
          handler: (data) => {
            const groupName = data.groupName.trim();
            if (groupName) {
              const newGroupId = `group-${Date.now()}`;
              this.reorderableStudentGroups.push({
                id: newGroupId,
                name: groupName,
                students: []
              });
              // this.updateMapVisualization();
              this.toastService.presentToast('Nuevo grupo creado: ' + groupName, 'success');
            } else {
              this.toastService.presentToast('El nombre del grupo no puede estar vacío.', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeGroup(groupId: string): void {
    const groupIndex = this.reorderableStudentGroups.findIndex(g => g.id === groupId);
    if (groupIndex > -1) {
      const groupToRemove = this.reorderableStudentGroups[groupIndex];

      if (groupToRemove.id === 'group-general') {
        this.toastService.presentToast('No se puede eliminar el grupo general.', 'warning');
        return;
      }

      if (groupToRemove.students.length > 0) {
        const generalGroup = this.reorderableStudentGroups.find(g => g.id === 'group-general');
        if (generalGroup) {
          generalGroup.students.push(...groupToRemove.students);
          console.log(`Moved ${groupToRemove.students.length} students from "${groupToRemove.name}" to "General" group.`);
          this.toastService.presentToast(`Estudiantes de "${groupToRemove.name}" movidos al grupo "General".`, 'success');
        } else {
          this.toastService.presentToast('No se encontró el grupo "General" para transferir estudiantes.', 'danger');
          console.warn('Could not find General group to transfer students!');
        }
      }
      this.reorderableStudentGroups.splice(groupIndex, 1);
    }
  }

  handleGroupReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const movedGroup = this.reorderableStudentGroups.splice(event.detail.from, 1)[0];
    this.reorderableStudentGroups.splice(event.detail.to, 0, movedGroup);
    event.detail.complete();
  }

  handleStudentReorder(event: CustomEvent<ItemReorderEventDetail>, groupIndex: number): void {
    const studentsInSourceGroup = this.reorderableStudentGroups[groupIndex].students;
    const movedStudent = studentsInSourceGroup.splice(event.detail.from, 1)[0];
    studentsInSourceGroup.splice(event.detail.to, 0, movedStudent);
    event.detail.complete();
  }

  async presentMoveStudentOptions(studentToMove: Student, currentGroupId: string): Promise<void> {
    const otherGroups = this.reorderableStudentGroups.filter(group => group.id !== currentGroupId);

    if (otherGroups.length === 0) {
      this.toastService.presentToast('No hay otros grupos disponibles para mover este estudiante.', 'warning');
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: `Mover a ${studentToMove.name} ${studentToMove.last_name} a:`,
      buttons: otherGroups.map(group => ({
        text: group.name,
        handler: () => {
          this.moveStudentToGroup(studentToMove, currentGroupId, group.id);
        }
      } as ActionSheetButton)).concat([
        {
          text: 'Cancelar',
          role: 'cancel'
        } as ActionSheetButton
      ])
    });
    await actionSheet.present();
  }

  moveStudentToGroup(student: Student, fromGroupId: string, toGroupId: string): void {
    const fromGroup = this.reorderableStudentGroups.find(g => g.id === fromGroupId);
    const toGroup = this.reorderableStudentGroups.find(g => g.id === toGroupId);

    if (fromGroup && toGroup) {
      const studentIndex = fromGroup.students.findIndex(s => s.id === student.id);
      if (studentIndex > -1) {
        const [movedStudent] = fromGroup.students.splice(studentIndex, 1);
        toGroup.students.push(movedStudent);
        this.toastService.presentToast(`"${movedStudent.name}" movido a "${toGroup.name}"`, 'success');
      }
    } else {
      this.toastService.presentToast('Error al mover estudiante: grupos no encontrados.', 'danger');
    }
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
        reorderedStudentsWithCoords:  this.reorderableStudentGroups,
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
