import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Components } from '@ionic/core'; // For ModalController type
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';

import { StudentsService } from 'src/app/services/students.service'; // Import your student service
import { Student } from 'src/app/interfaces/student.interface';

@Component({
  standalone: true,
  selector: 'app-select-students-modal',
  templateUrl: './select-students-modal.component.html',
  styleUrls: ['./select-students-modal.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    // Provide StudentsService here if not provided in root or higher up
    // StudentsService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SelectStudentsModalComponent implements OnInit {

  @Input() modal!: Components.IonModal;
  // Input: array of already selected student IDs
  @Input() currentStudentIds: Student[] = []; // Array of IDs, e.g., ['student1_id', 'student2_id']

  studentsForm!: FormGroup;
  availableStudents: any = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService // Inject your StudentsService
  ) {}

  ngOnInit() {
    this.initForm();
    // this.loadStudents();
  }

  initForm(): void {
    // The 'selectedStudents' FormArray will hold a FormControl for each selected student's ID
    this.studentsForm = this.fb.group({
      selectedStudents: this.fb.array([])
    });
    this.availableStudents = this.currentStudentIds

    console.log(this.availableStudents,';lpopopo');
        this.populateFormWithCurrentSelections();

  }

  get selectedStudentsFormArray(): FormArray {
    return this.studentsForm.get('selectedStudents') as FormArray;
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.studentsService.getAllStudents().pipe(
      tap((res: any) => {
        this.availableStudents = res.data.students;
        this.populateFormWithCurrentSelections();
      }),
      catchError(err => {
        console.error('Error fetching students:', err);
        this.errorMessage = 'Error al cargar los estudiantes. Por favor, inténtelo de nuevo.';
        return of([]); // Return an empty observable to complete the stream gracefully
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
  }

  // Populate the form array with students that are already selected
  populateFormWithCurrentSelections(): void {
    console.log(this.currentStudentIds,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

    if (this.currentStudentIds && this.currentStudentIds.length > 0) {
      this.currentStudentIds.forEach((selectStudent : any) => {
    console.log(selectStudent,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        // Ensure the ID corresponds to an available student before adding to form
        if (selectStudent.checked) {
    console.log(selectStudent.checked,'>>>>>>>>>>>>checked>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

          this.selectedStudentsFormArray.push(this.fb.control(selectStudent));
        }
      });
    }
  }

  // Check if a student is currently selected
  isStudentSelected(studentId: string): boolean {
    console.log(studentId,'isStudentSelected ------------------------------------');
    console.log(this.selectedStudentsFormArray,'this.selectedStudentsFormArray ------------------------------------');

    return this.selectedStudentsFormArray.controls.some(control => control.value.id === studentId);
  }

  // Handle checkbox change for a student
  onStudentCheckboxChange(event: CustomEvent, student: Student): void {
    const isChecked = event.detail.checked;
    if (isChecked) {
      // Add student ID to FormArray if not already present
      if (!this.isStudentSelected(student.id)) {
        this.selectedStudentsFormArray.push(this.fb.control(student.id));
      }
    } else {
      // Remove student ID from FormArray
      const index = this.selectedStudentsFormArray.controls.findIndex(control => control.value.id === student.id);
      if (index > -1) {
        this.selectedStudentsFormArray.removeAt(index);
      }
    }
    console.log('Current selected student IDs:', this.selectedStudentsFormArray.value);
  }

  // Dismiss the modal without saving (cancel action)
  dismissModal(action: 'cancel' | 'select' = 'cancel'): void {
    if (action === 'cancel') {
      this.modal.dismiss({ action: 'cancel' });
    } else {
      // Return the array of selected student IDs
      this.modal.dismiss({
        action: 'select',
        selectedStudentIds: this.selectedStudentsFormArray.value
      });
    }
  }

  // Method to be called when the user clicks 'Select' button
  onSelect(): void {
    this.modal.dismiss({
        action: 'select',
      selectedStudentIds: this.selectedStudentsFormArray.value
      // selectedWeekDays: this.weekDaysForm.value,
    });
  }
}
