import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lalearraga9905.arcadepack',
  appName: 'Arcade Pack',
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