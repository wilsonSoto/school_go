import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  standalone: false,
  selector: 'app-routes-vehicles',
  templateUrl: 'routes-vehicles.component.html',
  styleUrls: ['routes-vehicles.component.scss']
})
export class RoutesVehiclesComponent {

   constructor(
      private translate: TranslateService
    ) {}

  @Input() route_vehicle: any = null;


    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }
}
