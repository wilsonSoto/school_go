import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, CheckboxCustomEvent } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
// import { ProductsServices } from '../services/products.services';
import { filter } from 'rxjs';
import { LoadingController } from '@ionic/angular';


@Component({
  standalone: false,
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {}