import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ToastService } from '../shared/toast.service';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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

    const { email, password } = this.loginForm.value;

    if (email === 'test@test.com' && password === '123456') {
      this.toastService.presentToast('Bienvenido!','custom-success-toast')
      this.router.navigate(['tabs'])  

    } else {
      this.toastService.presentToast('Correo o contraseña incorrectos.')
    }
  }
}
