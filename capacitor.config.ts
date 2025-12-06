import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sealmaster.billing',
  appName: 'SealMaster',
  webDir: 'dist',
  server: {
    android: {
      allowMixedContent: true
    },
    ios: {
      allowsLinkPreview: false
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#4f46e5",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff"
    }
  }
};

export default config;
