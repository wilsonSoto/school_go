
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/login.service';


@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {

   constructor(
      private translate: TranslateService,
      private authService: AuthService,
    private router: Router ,


    ) {}

    user: any = {
  name: 'Wilson Soto',
  email: 'wilson@example.com',
  posts: 24,
  followers: 120,
  following: 80
};

editProfile() {
  console.log('Editar perfil');
}

goToSettings() {
  console.log('Ir a configuración');
}


  async logoutAndGoToSignIn() {
    await this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  @Input() parent: any = null;
  @Output() handleActionClient = new EventEmitter<string>();


  ngOnInit(): void {
      this.user = JSON.parse(localStorage.getItem('userData') ?? '{}')?.userInfo;

    console.log(this.user,'l;l;l;l');

  }

// user = {
//   name: 'María Pérez',
//   email: 'maria@example.com',
//   phone: '+1 (809) 555-1234',
//   address: 'Av. Duarte #123, Santo Domingo',
//   role: 'Padre', // o 'Chofer', 'Administrador'
//   accountStatus: 'Al día',
//   photo: '', // o URL de foto
// };


viewChildren() { /* ver hijos */ }
viewPaymentHistory() { /* historial de pagos */ }

viewRoutes() { /* rutas del chofer */ }
viewVehicle() { /* info del vehículo */ }

manageUsers() { /* admin usuarios */ }
viewReports() { /* ver reportes */ }


    changeLanguage(lang: string) {
      if (lang == 'es') {
        lang = 'en'
      } else {
        lang = 'es'

      }
      this.translate.use(lang);
    }

    showDetails() {
    this.handleActionClient.emit('edit')
  }
}
