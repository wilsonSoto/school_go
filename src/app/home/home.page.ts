import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { requestPushNotificationPermissions } from '../utils/notification-permissions'
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit  {
  // translate: any = ''
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es'); // idioma por defecto
    this.translate.use('es');            // idioma en uso
  }
  currentLang = 'es';
  toggleLanguage() {
    this.currentLang = this.currentLang === 'es' ? 'en' : 'es';
    this.translate.use(this.currentLang);
  }

  ngOnInit(): void {
    const req = requestPushNotificationPermissions()
    console.log(req,'ppppppppppppppppppp');
    
    
    PushNotifications.addListener('registration', (token) => {
      console.log('Token de dispositivo: ', token);
    });
    
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida: ', notification);
    });
    
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Acción realizada sobre la notificación: ', notification);
    });
    
  }
}
