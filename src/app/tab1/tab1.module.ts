import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

// import { HomePageModule } from './home/home.module';
export function HttpLoaderFactory(http: HttpClient) {
  // 👇 Aquí le dices que lea desde translate/
  return new TranslateHttpLoader(http, './assets/translate/', '.json');
}

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // ExploreContainerComponentModule,
    Tab1PageRoutingModule,
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
    Tab1Page,
    // EditProfileComponent,
    // VersionComponent,
    // EditProductComponent,
    // ScheduleComponent,
    // EditVehicleComponent,
    // InsurancePlusComponent,
  ],
  providers: [
    // DaterangepickerComponent, DaterangepickerDirective
  ],
})
export class Tab1PageModule {}
