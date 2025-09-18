import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Components } from '@ionic/core'; // For ModalController type
import { cleanToken } from 'src/app/shared/utils/cleanToken';
import { FcmService } from 'src/app/services/fcm.service';
import { ToastService } from 'src/app/services/toast.service';
import { tap, catchError, finalize, switchMap, map } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
// import second from '../../../../assets/images/logo-back.png'
interface UiMessage {
  id: string;
  text: string;
  me: boolean;
  createdAt: number; // epoch ms
  status?: 'sent' | 'delivered' | 'read';
}

@Component({
  selector: 'app-chat-preview',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.scss'],
})
export class ChatPreviewComponent {
  constructor(
    private fcmService: FcmService,
    private toastService: ToastService
  ) {}
  title = 'Chofer3';
  // subtitle = 'Ruta 4 • carlito';

  // chat.page.ts / .component.ts
  chatEnabled = false; // ← cámbialo a true cuando actives el chat real

  infoMsg = {
    title: 'Chat en preparación',
    body: 'Estamos trabajando para habilitar la conversación entre padres y choferes.',
    hint: 'Mientras tanto, puedes enviar una notificación desde aquí.',
  };

  @Input() infoMSM: any = {};
  @Input() subtitle = 'Ruta 4 • carlito';
  // @Output() send = new EventEmitter<{ text: string }>();

  @Input() modal!: Components.IonModal;
  text = '';
  typing = false;

  messages: UiMessage[] = [
    {
      id: '1',
      text: '¿A qué hora llegarás?',
      me: true,
      createdAt: Date.now() - 1000 * 60 * 8,
    },
    {
      id: '2',
      text: 'Llegaré en unos 10 minutos',
      me: false,
      createdAt: Date.now() - 1000 * 60 * 6,
    },
    {
      id: '3',
      text: 'Estoy en camino',
      me: true,
      createdAt: Date.now() - 1000 * 60 * 4,
      status: 'delivered',
    },
    {
      id: '4',
      text: 'Gracias',
      me: false,
      createdAt: Date.now() - 1000 * 60 * 2,
    },
    {
      id: '5',
      text: 'De acuerdo',
      me: true,
      createdAt: Date.now() - 1000 * 60,
      status: 'read',
    },
  ];

  send() {
    const val = this.text.trim();
    if (!val) return;
    const now = Date.now();
    this.sendProximityNotification(val);
    this.messages.push({
      id: 'tmp-' + now,
      text: val,
      me: true,
      createdAt: now,
      status: 'sent',
    });
    this.text = '';
    setTimeout(() => this.scrollToBottom(), 0);
  }

  async sendProximityNotification(val: string) {
    let tokenReview = await cleanToken(this.infoMSM.fcm_token);

    const notificationData = {
      token: tokenReview ?? null,
      msm: val,
      title: 'Notificación de EscolarGo',
    };

    if (notificationData.token) {
      this.fcmService
        .sendNotification(notificationData)
        .pipe(
          tap((response: any) => {
            this.toastService.presentToast('✅ Notificación enviada', 1);
            if (response.data) {
              console.log(response);
              console.log('✅ Notificación enviada', response);
            }
          }),
          catchError((err) => {
            this.toastService.presentToast(JSON.stringify(err));
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } else {
      this.toastService.presentToast(`⚠️ No se encontró token FCM para prueba`);

      console.warn(`⚠️ No se encontró token FCM para prueba`);
    }
  }

  isMine(m: UiMessage) {
    return m.me;
  }
  trackById(_i: number, m: UiMessage) {
    return m.id;
  }

  onScroll(_ev: any) {
    // Hook para cargar más (si quisieras)
  }

   dismissModal(action: 'cancel' | 'save' = 'cancel'): void {
      if (action === 'cancel') {
        this.modal.dismiss({ action: 'cancel' });
      } 
    }
  

  private scrollToBottom() {
    const el = document.querySelector('.chat-scroll') as HTMLElement | null;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}
