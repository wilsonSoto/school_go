import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ToastService } from '../services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './../services/login.service';
// import {} from '../../assets/images/logo.png'
@Component({
  selector: 'app-login',
  standalone: false,
//   imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
mostrarAnimacion: boolean = false; // Variable para controlar la visibilidad del GIF de fondo

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private toastService: ToastService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      // email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }
    // Cambiar el idioma (por ejemplo, con un botón)
  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  async login() {
    if (this.loginForm.invalid) {
      this.toastService.presentToast('Por favor, completa todos los campos.')
      return;
    }

    const { login, password } = this.loginForm.value;
    if (login && password) {

      this.mostrarAnimacion = true;

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
