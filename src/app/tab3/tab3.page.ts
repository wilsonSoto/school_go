import { Component, OnDestroy, OnInit } from '@angular/core';
// import { ClientServices } from '../services/clients.services';
import { NavigationEnd, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs';
import { LoadingController } from '@ionic/angular';


@Component({
  standalone: false,
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {}