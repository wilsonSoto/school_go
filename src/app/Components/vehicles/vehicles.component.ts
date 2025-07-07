import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  standalone: false,
  selector: 'app-vehicles',
  templateUrl: 'vehicles.component.html',
  styleUrls: ['vehicles.component.scss']
})
export class VehiclesComponent {
   constructor(
      private translate: TranslateService
    ) {}

  @Input() currentVehicle: any = null;
  @Output() handleActionDriver = new EventEmitter<string>();

    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }


  showDetails() {
    this.handleActionDriver.emit('edit')
  }
}
