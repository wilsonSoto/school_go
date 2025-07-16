import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParentService
 } from '../services/parents.service';
import { ToastService } from '../services/toast.service';
import { IonTabs } from '@ionic/angular'; // Si quieres tipar el evento

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],

  standalone: false,
})
export class TabsPage   {


  constructor(private router: Router,

  ) {} // Inyecta el Router

  @ViewChild('myTabs')
  tabs!: IonTabs; // Declara la propiedad para la referencia a IonTabs


  ngOnInit() {
    this.router.navigateByUrl('/tabs/tab3', { replaceUrl: true });
  }

    tabDidChange(event?: any) { // El evento contiene información sobre la pestaña cambiada

  }




}
