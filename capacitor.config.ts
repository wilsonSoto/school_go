import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.kabaygroup.escolar.go',
  appName: 'EscolarGo',
  webDir: 'www',
  plugins: {
    GoogleMap: {
      apiKey: 'AIzaSyDtmiNwQ0ENlzy3taEnwcHck41TXOWbWao', // <--- ¡COLOCA TU CLAVE API REAL AQUÍ!
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
