import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(private translate: TranslateService, private router: Router) {
    // this.translate.setDefaultLang('es'); // idioma por defecto
     this.initializeApp();
    //  this.translate.use('es');  
    // this.router.navigate(['tabs'])          // idioma en uso
  }

    initializeApp() {
    // Establece el idioma por defecto a 'es' (español)
    this.translate.setDefaultLang('es');

    // Intenta usar el idioma del navegador, si está disponible entre tus traducciones
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && (browserLang === 'es' || browserLang === 'en')) {
      this.translate.use(browserLang);
    } else {
      this.translate.use('es'); // Si no, usa el idioma por defecto
    }

    // Puedes también añadir lógica para guardar y cargar la preferencia de idioma del usuario
  }
}
