import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

import { TranslateModule } from '@ngx-translate/core'; // 👈 Asegúrate de importar esto


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TranslateModule 
  ],
  declarations: [HomePage],
    exports: [
    HomePage // <--- ¡MUY IMPORTANTE! Exporta el componente para que otros módulos puedan usarlo.
  ],
})
export class HomePageModule {}
