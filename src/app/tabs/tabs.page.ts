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
userData: any = null;

  constructor(private router: Router,

  ) {} // Inyecta el Router

  @ViewChild('myTabs')
  tabs!: IonTabs; // Declara la propiedad para la referencia a IonTabs


  ngOnInit() {
    this.userData = localStorage.getItem('userData')
    this.router.navigateByUrl('/tabs/route', { replaceUrl: true });
  }

  get showTabsPermission () {
    this.userData = JSON.parse(localStorage.getItem('userData') ?? "")

    if (this.userData?.roles?.some((rol: any) => rol.external_id == "pool.group_school_father")) {
      return [false, false, true, false, true ]
    } else {
      return [true, true, true, true, true ]

    }
    // return
  }

    tabDidChange(event?: any) { // El evento contiene información sobre la pestaña cambiada

  }




}
