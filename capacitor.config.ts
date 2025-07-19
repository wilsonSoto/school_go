import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.kabaygroup.escolar.go',
  appName: 'EscolarGo',
  webDir: 'www',
  plugins: {
    GoogleMap: {
      apiKey: 'AIzaSyBsnbQOBYbbUuDL2Dzpd_7D-wlXz-1B5bg', // <--- ¡COLOCA TU CLAVE API REAL AQUÍ!
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
