import { LoginService } from './services/login.service';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './notificaciones/firebase-config';



import { IonInput } from '@ionic/angular/standalone';

import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddDriversComponent } from './Components/add-drivers/add-drivers.component';
import { AddVehiclesComponent } from './Components/add-vehicles/add-vehicles.component';


import { HttpInterceptorService } from './interceptor/http-interceptor';
import { AuthInterceptorService } from './interceptor/auth-interceptor';
import { AddParentComponent } from './Components/add-parent/add-parent.component';
import { AddStudentsComponent } from './Components/add-students/add-students.component';
import { StudentsComponent } from './Components/students/students.component';
// import { ClientsComponent } from './Components/clients/clients.component';
// import { DriversComponent } from './Components/drivers/drivers.component';
// import { VehiclesComponent } from './Components/vehicles/vehicles.component';

import { CameraComponent } from './Components/actions-services/camera/camera.component';
// import { MapsComponent } from './Components/actions-services/maps/maps.component';
import { CapitalCasePipe } from "./pipes/capital-case.pipe";
import { ParentService } from './services/parents.service';
import { StudentsService } from './services/students.service';
import { AddRouteComponent } from './Components/add-route/add-route.component';
import { RouteService } from './services/route.service';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';
import { RouteTrackingPlannedService } from './services/route-tracking-planned.service';
import { ObserverBetweenComponentsService } from './services/observer-between-components.services';
import { RouteTrackingService } from './services/route-tracking.service';
import { UbicationModalComponent } from './Components/actions-services/ubication-modal/ubication-modal.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import { GoogleDirectionsService } from './services/google-directions.service';
import { VersionUpdateComponent } from './Components/actions-services/version-update/version-update.component';
// import { SelectWeekDayComponent } from './Components/actions-services/select-week-day/select-week-day.component';
// import { AllRouteComponent } from './Components/all-rute/all-rute.component';


// import { HomePageModule } from './home/home.module';
export function HttpLoaderFactory(http: HttpClient) {
  // 👇 Aquí le dices que lea desde translate/
  return new TranslateHttpLoader(http, './assets/translate/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddDriversComponent,
    AddVehiclesComponent,
    AddParentComponent,
    AddStudentsComponent,
    StudentsComponent,
    EditProfileComponent,
    UbicationModalComponent,
    VersionUpdateComponent,
    // SelectWeekDayComponent,
    // AddRouteComponent,
    // AllRouteComponent,


    CameraComponent,
    // MapsComponent,
    // CapitalCasePipe
  ],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
        }
    }),
    CapitalCasePipe
],
  providers: [
    LoginService,
    ParentService,
    StudentsService,
    RouteService,
    RouteTrackingPlannedService,
    ObserverBetweenComponentsService,
    RouteTrackingService,
    GoogleDirectionsService,
    {
    provide: RouteReuseStrategy,
    useClass: IonicRouteStrategy,

    },
     {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
