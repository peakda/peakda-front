import type { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.CAPACITOR_SERVER_URL

if (serverUrl && new URL(serverUrl).protocol !== 'https:') {
  throw new Error('CAPACITOR_SERVER_URL must use HTTPS')
}

const config: CapacitorConfig = {
  appId: 'com.peakda.app',
  appName: 'Peakda',
  webDir: 'capacitor-web',
  loggingBehavior: 'debug',
  backgroundColor: '#ffffff',
  zoomEnabled: false,
  android: {
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
  server: serverUrl
    ? {
        url: serverUrl,
        androidScheme: 'https',
        cleartext: false,
        errorPath: 'error.html',
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
  },
}

export default config
