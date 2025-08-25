import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs } from '@ionic/angular'; // Si quieres tipar el evento
import { userRoleEnum } from 'src/types';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],

  standalone: false,
})
export class TabsPage   {
userData: any = null;

  students: any = [];
  constructor(private router: Router,  ) {} // Inyecta el Router

  @ViewChild('myTabs')
  tabs!: IonTabs; // Declara la propiedad para la referencia a IonTabs


 async ngOnInit() {
    // this.userData = await JSON.parse(localStorage.getItem('userData') || 'null')
      // this.userData = JSON.parse(localStorage.getItem('userData') ?? '{}')?.userInfo;

    this.router.navigateByUrl('/tabs/route', { replaceUrl: true });
  }

  get showTabsPermission () {
      this.userData = JSON.parse(localStorage.getItem('userData') ?? '{}');

    if (this.userData?.roles?.some((rol: any) => rol.external_id == userRoleEnum.partner || rol.external_id == userRoleEnum.driver)) {
      // return [true, true, true, true, true ]
      return [false, false, true, false, true ]
    } else {
      return [true, true, true, true, true ]

    }
    // return
  }

    tabDidChange(event?: any) { // El evento contiene información sobre la pestaña cambiada

  }




}
