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
     private parentService: ParentService
,
        private toastService: ToastService,

  ) {} // Inyecta el Router

  @ViewChild('myTabs')
  tabs!: IonTabs; // Declara la propiedad para la referencia a IonTabs


  ngOnInit() {
    this.router.navigateByUrl('/tabs/tab3', { replaceUrl: true });
  }

    tabDidChange(event?: any) { // El evento contiene información sobre la pestaña cambiada

    //   if (event && event.tab) {
    //   console.log('La pestaña activa ha cambiado a:', event.tab);
    //   // Aquí puedes añadir lógica específica según la pestaña
    //   if (event.tab === 'tab1') {
    //     console.log('Estás en la pestaña de Clientes');
    //   } else if (event.tab === 'tab2') {
    //     console.log('Estás en la pestaña de Choferes');
    //   }
    //   // ... y así sucesivamente para otras pestañas
    // } else {
    //   // Esto podría suceder si el evento no se tipa correctamente o si la estructura del evento es inesperada
    //   console.log('Se detectó un cambio de pestaña, pero no se pudo obtener el nombre de la pestaña.');
    // }
  }
}
