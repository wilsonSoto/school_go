import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
// import { NgxDaterangepickerMd, DaterangepickerComponent,DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { VehiclesComponent } from '../Components/vehicles/vehicles.component';
import { DriversComponent } from '../Components/drivers/drivers.component';
import { DriversService } from '../services/drivers.service';
import { VehiclesService } from '../services/vehicles.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/translate/', '.json');
}

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    })

  ],
  declarations: [
    Tab2Page,
    VehiclesComponent,
    DriversComponent
  ],
  providers: [
    DriversService,
    VehiclesService
    // DaterangepickerComponent,
    // DaterangepickerDirective,
   ],
})
export class Tab2PageModule {}
