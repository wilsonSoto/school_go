import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TabsPage } from './tabs.page';
import { HttpClient } from '@angular/common/http';

import { IonTabs } from '@ionic/angular'; // Si quieres tipar el evento
import { ParentService } from '../services/parents.service';


// import { HomePageModule } from './home/home.module';
export function HttpLoaderFactory(http: HttpClient) {
  // 👇 Aquí le dices que lea desde translate/
  return new TranslateHttpLoader(http, './assets/translate/', '.json');
}
// import { NgxDaterangepickerMd, DaterangepickerComponent,DaterangepickerDirective } from 'ngx-daterangepicker-material';
// import { RentalHistoryComponent } from '../rental-history/rental-history.component'
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    // NgxDaterangepickerMd.forRoot({
    //   format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    //   displayFormat: 'MM/DD/YYYY', // default is format value
    // })
     TranslateModule.forRoot({
          defaultLanguage: 'es',
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          }
        })
  ],
  declarations: [TabsPage],
  providers: [  ParentService
    // DaterangepickerComponent,
    // DaterangepickerDirective,
   ],
})

export class TabsPageModule {}
