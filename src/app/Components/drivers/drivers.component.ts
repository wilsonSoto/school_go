import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DriversService } from 'src/app/services/drivers.service';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  standalone: false,
  selector: 'app-drivers',
  templateUrl: 'drivers.component.html',
  styleUrls: ['drivers.component.scss']
})
export class DriversComponent {
   constructor(
      private translate: TranslateService,
      private toastService: ToastService,
      private driversService: DriversService,
    ) { }

  @Input() currentDriver: any = null;
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
