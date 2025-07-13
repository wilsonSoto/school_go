import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  standalone: false,
  selector: 'app-all-route',
  templateUrl: 'all-route.component.html',
  styleUrls: ['all-route.component.scss']
})
export class AllRouteComponent {

   constructor(
      private translate: TranslateService
    ) {}

  @Input() route: any = null;
  @Output() handleActionClient = new EventEmitter<string>();


    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }

    showDetails() {
    this.handleActionClient.emit('edit')
  }
}
