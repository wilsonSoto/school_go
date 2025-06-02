import { Component,OnChanges,OnDestroy,OnInit, SimpleChanges } from '@angular/core';
import { Router,ActivatedRoute, NavigationEnd   } from '@angular/router';
// import { AppointmentServices } from '../services/appointments.services';
// import moment from 'moment';
import { filter } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { ClientServices } from '../services/clients.services';
// import { LoadingController } from '@ionic/angular';
// import { VehicleServices } from '../services/vehicles.services';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc'; // Importa el plugin de UTC

// dayjs.extend(utc); // Habilita el uso de UTC en Day.js

@Component({
  selector: 'app-tab4',
  standalone: false,
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {}