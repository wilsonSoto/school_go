import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoutePage } from './route.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { DriverPageRoutingModule } from './route-routing.module';
// import { NgxDaterangepickerMd, DaterangepickerComponent,DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { VehiclesComponent } from '../Components/vehicles/vehicles.component';
import { DriversComponent } from '../Components/drivers/drivers.component';
import { CapitalCasePipe } from "../pipes/capital-case.pipe";
import { RouteService } from '../services/route.service';
import { AllRouteComponent } from '../Components/all-route/all-rute.component';
import { SharedModule } from '../shared/module/shared.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/translate/', '.json');
}

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // ExploreContainerComponentModule,
    DriverPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
        }
    }),
    CapitalCasePipe,
    SharedModule
],
  declarations: [
    RoutePage,
    // AllRouteComponent
    // VehiclesComponent,
    // DriversComponent
  ],
  providers: [
      RouteService
    // DaterangepickerComponent,
    // DaterangepickerDirective,
   ],
})
export class DriverPageModule {}
