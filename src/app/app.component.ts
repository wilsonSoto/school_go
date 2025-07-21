import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FcmService } from './services/fcm.service';
import { ParentService } from './services/parents.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  userData: any = '';

  constructor(private translate: TranslateService, 
    private router: Router, 
    private platform: Platform, private fcm: FcmService,
  
    private parentService: ParentService,
    private toastService: ToastService
  ) {
     this.initializeApp();
    this.platform.ready().then(() => {
      this.fcm.initPush().then();
    }).catch((e: any) => {
      console.log(e);
      alert(e)
    })

  }



  async ngOnInit() {
    localStorage.removeItem('studentsWithoutLocation')
    this.translate.setDefaultLang('es');
    this.userData = await JSON.parse(localStorage.getItem('userData') || 'null')
      ?.userInfo;
    if (this.userData?.partner_id) {
      this.getParent();
    }
  }

  async initializeApp() {
    // Establece el idioma por defecto a 'es' (español)

    // Intenta usar el idioma del navegador, si está disponible entre tus traducciones
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && (browserLang === 'es' || browserLang === 'en')) {
      this.translate.use(browserLang);
    } else {
      this.translate.use('es'); // Si no, usa el idioma por defecto
    }
  }

  getParent() {
    this.parentService.getParent(this.userData?.partner_id).subscribe({
      next: (response: any) => {
        const studentsWithoutLocation = response.data.students.filter(
          (student: any) =>
            !student.home_latitude ||
            !student.home_longitude ||
            student.home_latitude === 0 ||
            student.home_longitude === 0
        );
        if (studentsWithoutLocation && studentsWithoutLocation.length > 0) {
          localStorage.setItem('studentsWithoutLocation', JSON.stringify(studentsWithoutLocation));
          this.router.navigateByUrl('/pending-location', { replaceUrl: true });
        }
      },
      error: (err: any) => {
        const errorMessage =
          err.error.error.message ||
          err.error.error ||
          err?.message ||
          'Error desconocido';

        this.toastService.presentToast(errorMessage);
      },
    });
  }
}
