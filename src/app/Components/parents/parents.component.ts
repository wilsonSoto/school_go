import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  standalone: false,
  selector: 'app-parents',
  templateUrl: 'parents.component.html',
  styleUrls: ['parents.component.scss']
})
export class ParentsComponent implements OnInit {

   constructor(
      private translate: TranslateService
    ) {}

  @Input() parent: any = null;
  @Output() handleActionClient = new EventEmitter<string>();


  ngOnInit(): void {
    console.log(this.parent,'l;l;l;l');

  }
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
