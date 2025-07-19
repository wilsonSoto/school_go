import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ToastService } from '../services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './../services/login.service';
import { FcmService } from '../services/fcm.service';
// import {} from '../../assets/images/logo.png'
import { StorageService } from '../services/storage.service';
import { Platform } from '@ionic/angular';
import { hostUrlEnum } from 'src/types';
@Component({
  selector: 'app-login',
  standalone: false,
//   imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
mostrarAnimacion: boolean = false; // Variable para controlar la visibilidad del GIF de fondo
token = ""

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private toastService: ToastService,
    private loginService: LoginService,
    private router: Router,
    private storage: StorageService,
        private platform: Platform,
         private fcm: FcmService
  ) {
    this.loginForm = this.fb.group({
      // email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required]],
      password: ['', Validators.required],
      fcm_token: ['']
    });
  }
  ngOnInit(): void {
        this.storage.get(hostUrlEnum.FCM_TOKEN).then((resp) => {
          this.token = JSON.stringify(resp)
          console.log(this.token,'11111111111111111111111111');
          
        })
  }
    // Cambiar el idioma (por ejemplo, con un botón)
  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  addTokenNotificationAndLogin() {
    console.log(this.token,'2222222222');

    // if (!this.token || this.token == '') {
    console.log(this.token,'33333333333');
    this.platform.ready().then(() => {
        this.fcm.initPush().then();
        this.login() 

      }).catch((e: any) => {
        console.log(e);
        alert(e)
        this.login() 

      })
    // }
  }

  async login() {
    
    if (this.loginForm.invalid) {
      this.toastService.presentToast('Por favor, completa todos los campos.')
      return;
    }

    const { login, password } = this.loginForm.value;
    if (login && password) {

      this.mostrarAnimacion = true;
      this.loginForm.value.fcm_token = this.token
      this.loginService
        .login( this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            console.log(response,'respo');
localStorage.setItem('token', response.result.token)
localStorage.setItem('userData', JSON.stringify(response.result))
          this.toastService.presentToast('Bienvenido!','custom-success-toast')
          this.router.navigate(['tabs'])

      // this.mostrarAnimacion = false;

          },
          error: (err: any) => {
      // this.mostrarAnimacion = false;
            const errorMessage =
              err.error.error.message ||
              err.error.error ||
              err?.message ||
              'Error desconocido';

            this.toastService.presentToast(errorMessage)

          },
        });

      } else {
        this.toastService.presentToast('Usuario o contraseña no tiene información. Por favor complete todos los campos.')
      }
  }
}
