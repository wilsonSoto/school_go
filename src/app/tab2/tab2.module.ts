import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
// import { NgxDaterangepickerMd, DaterangepickerComponent,DaterangepickerDirective } from 'ngx-daterangepicker-material';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    ReactiveFormsModule,
    // NgxDaterangepickerMd.forRoot({
    //   format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    //   displayFormat: 'MM/DD/YYYY', // default is format value
    // }),
    
  ],
  declarations: [Tab2Page],
  providers: [  
    // DaterangepickerComponent,
    // DaterangepickerDirective,
   ],
})
export class Tab2PageModule {}
