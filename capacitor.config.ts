import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pulseflow.app',
  appName: '脉律',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
