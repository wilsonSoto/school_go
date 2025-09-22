
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/login.service';


interface CompanyFile {
  id: number;
  name: string;
  sequence: number;
  url: string;
  type: 'image' | 'pdf' | 'link';
}

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
};

company: any = {}
  companyFiles: CompanyFile[] = [
    {
      id: 11,
      name: 'Datos de Transferencia',
      sequence: 10,
      url: 'https://kabaygroup.com/api/image/company.image/11/image_1920/',
      type: 'image'
    },
    {
      id: 12,
      name: 'Contrato de Servicio',
      sequence: 10,
      url: 'https://kabaygroup.com/api/image/company.image/12/image_1920/',
      type: 'image'
    }
  ];

  viewerOpen = false;
  activeFile?: CompanyFile;

  preview(file: CompanyFile) {
    this.activeFile = file;
    this.viewerOpen = true;
  }

  download(file: CompanyFile) {
    const a = document.createElement('a');
    a.href = file.url;
    a.target = '_blank';
    a.download = (file.name || 'documento').replace(/\s+/g, '_');
    a.click();
  }
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
      const data = JSON.parse(localStorage.getItem('userData') ?? '{}');
this.user = data?.userInfo;
this.company = data?.company;
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
