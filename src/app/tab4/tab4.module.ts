import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { ProfileComponent } from '../Components/profile/profile.component';
// import { DaterangepickerComponent, DaterangepickerDirective, NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // ExploreContainerComponentModule,
    Tab4PageRoutingModule,
    ReactiveFormsModule,
    // NgxDaterangepickerMd.forRoot({
    //   format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    //   displayFormat: 'MM/DD/YYYY', // default is format value
    // }),
  ],
  declarations: [Tab4Page,
    ProfileComponent,

  ],
  providers: [ ],

})
export class Tab4PageModule {}
