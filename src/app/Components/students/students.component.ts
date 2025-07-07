import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  standalone: false,
  selector: 'app-students',
  templateUrl: 'students.component.html',
  styleUrls: ['students.component.scss']
})
export class StudentsComponent {

   constructor(
      private translate: TranslateService
    ) {}

  @Input() student: any = null;
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
