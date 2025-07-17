import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Components } from '@ionic/core';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonItem,
  IonList,
  IonPopover,
} from '@ionic/angular/standalone';

import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms'; // Import Reactive Forms modules
import { Router } from '@angular/router'; // Assuming you might use router for defaultHref

@Component({
  standalone: true,
  selector: 'app-select-week-day',
  templateUrl: 'select-week-day.component.html',
  styleUrls: ['select-week-day.component.scss'],
  imports: [
    // <-- Asegúrate de que CommonModule esté aquí
    CommonModule, // <--- Añade CommonModule para *ngIf, *ngFor, etc.
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SelectWeekDayComponent implements OnInit {
  @Input() modal!: Components.IonModal;

  @Input() currentSchedules: any = null;
  @Output() weekDaySelected = new EventEmitter<string>();
  allDate: boolean = false;

  get defaultHref(): string {
    let href = '/tabs';

    return href;
  }

  @ViewChild('timePopover') timePopover!: IonPopover; // If you manage a single popover instance

  weeks: WeekDay[] = [
    {
      day: 0,
      name: 'Lunes',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 1,
      name: 'Martes',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 2,
      name: 'Miércoles',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 3,
      name: 'Jueves',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 4,
      name: 'Viernes',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 5,
      name: 'Sábado',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
    {
      day: 6,
      name: 'Domingo',
      session_start_time: '',
      session_end_time: '',
      checked: false,
    },
  ];

  weekDaysForm!: FormGroup; // The main form group

  selectedWeekDayForPopover: WeekDay | null = null;
  isPopoverOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router // If you need router for defaultHref
  ) {}

  ngOnInit() {
    this.initForm();


    // Populate form if currentSchedules has data
    if (this.currentSchedules && this.currentSchedules.length > 0) {
      this.currentSchedules.forEach((incomingSchedule: IncomingRouteSchedule) => {
        const dayId = parseInt(incomingSchedule.day, 10); // Convert string 'day' to number
        const weekDayToUpdate = this.weeks.find(w => w.day === dayId);

        if (weekDayToUpdate) {
          // Update the `weeks` array item's properties
          weekDayToUpdate.checked = true;
          weekDayToUpdate.session_start_time = incomingSchedule.session_start_time;
          weekDayToUpdate.session_end_time = incomingSchedule.session_end_time;

          // Add this updated weekDay to the FormArray
          this.addDayToForm(weekDayToUpdate);
        }
      });
    }
  }

  initForm() {
    this.weekDaysForm = this.fb.group({
      days: this.fb.array([]), // This FormArray will hold selected days' time info
    });
    this.currentSchedules.forEach((day: any) => {
      if (day.checked) {
        this.addDayToForm(day);
      }
    });
  }

  get daysFormArray(): FormArray {
    return this.weekDaysForm.get('days') as FormArray;
  }

  isActiveAllDay() {
    // console.log(event,'......................');

    // console.log(this.currentSchedules,'this.currentSchedules');
    console.log(this.daysFormArray,'this.currentSthis.daysFormArraychedules');
    let data: any = {};
    if (this.allDate) {
       this.weeks.forEach((d: any) => {
       data = {
          day: d.day,
          name: d.name,
          session_start_time: this.daysFormArray?.value[0]?.session_start_time,
          session_end_time: this.daysFormArray?.value[0]?.session_end_time,
          checked: true,
        }

        this.addDayToForm(data);

      });
      return
    }
    this.weekDaysForm = this.fb.group({
      days: this.fb.array([]), // This FormArray will hold selected days' time info
    });
  }


  // In your SelectWeekDayComponent class:
  getStartTimeControl(dayId: number): FormControl | any {
    const dayFormGroup = this.findDayFormGroup(dayId);
    return (dayFormGroup?.get('session_start_time') as FormControl) || String;
  }

  getCheckedControl(dayId: number): FormControl | any {
    const dayFormGroup = this.findDayFormGroup(dayId);
    return (dayFormGroup?.get('checked') as FormControl) || String;
  }

  getEndTimeControl(dayId: number): FormControl | any {
    const dayFormGroup = this.findDayFormGroup(dayId);
    return (dayFormGroup?.get('session_end_time') as FormControl) || String;
  }
  // Helper to find a day's FormGroup in the FormArray
  findDayFormGroup(dayId: number): FormGroup | undefined {
    return this.daysFormArray.controls.find(
      (control) => (control as FormGroup).get('day')?.value === dayId
    ) as FormGroup;
  }

  // Adds a day's FormGroup to the FormArray
  addDayToForm(day: WeekDay) {
    if (!this.findDayFormGroup(day.day)) {
      console.log(day,'22222222222222222222222222222222222');

      // Only add if not already present
      this.daysFormArray.push(
        this.fb.group({
          day: day.day,
          checked: day.checked,
          name: day.name,
          session_start_time: [day.session_start_time, Validators.required], // Add validators if needed
          session_end_time: [day.session_end_time, Validators.required],
        })
      );
    }
      console.log(day,'333333333333333333333333333333333333');
  }

  // Removes a day's FormGroup from the FormArray
  removeDayFromForm(dayId: number) {
    const index = this.daysFormArray.controls.findIndex(
      (control) => (control as FormGroup).get('day')?.value === dayId
    );
    if (index > -1) {
      this.daysFormArray.removeAt(index);
    }
  }

  // Handles the checkbox change
  onCheckboxChange(event: CustomEvent, weekDay: WeekDay) {
    weekDay.checked = event.detail.checked; // Update the WeekDay object's checked state

    if (weekDay.checked) {
      this.addDayToForm(weekDay);
      // Automatically open popover for the newly checked day if desired
      // this.openTimePopover(event, weekDay);
    } else {
      this.removeDayFromForm(weekDay.day);
      // Close popover if it was open for this day
      if (this.selectedWeekDayForPopover?.day === weekDay.day) {
        this.isPopoverOpen = false;
        this.selectedWeekDayForPopover = null;
      }
    }
    console.log('Current form value:', this.weekDaysForm.value);
  }

  // Opens the popover for a specific day
  async openTimePopover(event: Event, weekDay: WeekDay) {
    this.selectedWeekDayForPopover = weekDay; // Set the day for the popover
    this.timePopover.event = event; // Position the popover correctly
    this.isPopoverOpen = true;

    // Optional: If you want to link the form controls to the popover's inputs directly,
    // ensure the day's form group is in the FormArray when opening the popover.
    // If the checkbox isn't checked, you might want to auto-check it here or
    // provide a way to add it to the form if the user sets times without checking.
    if (!weekDay.checked) {
      weekDay.checked = true; // Mark as checked if times are being set
      this.addDayToForm(weekDay); // Add to form array if not there
      // Optionally update the checkbox in UI: this.daysFormArray.controls.find(...)
    }
  }

  // Closes the popover
  closePopover() {
    this.isPopoverOpen = false;
    if (this.selectedWeekDayForPopover) {
      // You might want to log the specific form group data here
      const dayFormGroup = this.findDayFormGroup(
        this.selectedWeekDayForPopover.day
      );
      if (dayFormGroup) {
        console.log(
          `Time updated for ${this.selectedWeekDayForPopover.name}:`,
          dayFormGroup.value
        );
      }
    }
    // No need to nullify selectedWeekDayForPopover immediately, it's fine until next open
  }

  // Dismisses the modal
  dismissModal() {
    // You can pass data back to the parent component that opened this modal
    this.modal.dismiss(this.weekDaysForm.value); // Pass the form data
  }

  // Method to be called when you want to submit/get the form data
  submitForm() {
    console.log('selec copmonent Form Data:', this.weekDaysForm.value);
    // Here you would typically send this data to your service
    // e.g., this.routeService.updateRouteDays(this.weekDaysForm.value);

    this.modal.dismiss({
      selectedWeekDays: this.weekDaysForm.value,
      action: 'proceed',
    });
  }
}

interface WeekDay {
  day: number;
  name: string;
  session_start_time: string;
  session_end_time: string;
  checked: boolean; // Add a property for the checkbox state
}
// Define the interface for the incoming schedule data from AddRouteComponent
interface IncomingRouteSchedule {
  session_start_time: string;
  session_end_time: string;
  day: string; // This is a string ('0', '1', etc.) from the parent
}
