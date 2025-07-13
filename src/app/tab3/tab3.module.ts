import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { RoutesVehiclesComponent } from '../Components/routes-vehicles/routes-vehicles.component';
import { AllRouteComponent } from '../Components/all-route/all-rute.component';
import { CapitalCasePipe } from "../pipes/capital-case.pipe";
import { RouteService } from '../services/route.service';
import { SharedModule } from '../shared/module/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // ExploreContainerComponentModule,
    Tab3PageRoutingModule,
    ReactiveFormsModule,
    CapitalCasePipe,
    SharedModule
],
  declarations: [
    Tab3Page,
    RoutesVehiclesComponent,
    // AllRouteComponent
  ],
   providers: [
      RouteService

      // DaterangepickerComponent, DaterangepickerDirective
    ],
})
export class Tab3PageModule {}
