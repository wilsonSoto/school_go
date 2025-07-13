import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.school.go.starter',
  appName: 'schoolGo',
  webDir: 'www',
  plugins: {
    GoogleMap: {
      apiKey: 'AIzaSyBsnbQOBYbbUuDL2Dzpd_7D-wlXz-1B5bg', // <--- ¡COLOCA TU CLAVE API REAL AQUÍ!
    },
  },
};

export default config;
