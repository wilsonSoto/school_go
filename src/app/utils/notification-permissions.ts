import { PushNotifications } from '@capacitor/push-notifications';

export async function requestPushNotificationPermissions() {
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive) {
    console.log('Permisos para notificaciones push concedidos');
    // Ahora puedes registrar el dispositivo
    PushNotifications.register();
  } else {
    console.error('Permisos para notificaciones push denegados');
  }
}
