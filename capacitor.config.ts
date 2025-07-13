import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.school.go.starter',
  appName: 'schoolGo',
  webDir: 'www',
  plugins: {
    GoogleMap: {
      apiKey: 'n/a', // <--- ¡COLOCA TU CLAVE API REAL AQUÍ!
    },
  },
};

export default config;
