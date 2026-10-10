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
      appIdAndroid: 'ca-app-pub-9199449066843163~5972741273',
    }
  }
};

export default config;