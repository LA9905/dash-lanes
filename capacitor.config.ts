import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tunombre.dashlanes',
  appName: 'Dash Lanes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      // Los IDs reales los pones después de crear la app en AdMob
    }
  }
};

export default config;