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
      // 원격 URL 이 그려지기 전에 스플래시가 걷히면 흰 화면이 보인다. 평소에는
      // NativeSplash 가 첫 프레임 직후 hide() 를 부르고, 이 값은 그게 실패했을 때의 상한선이다.
      launchShowDuration: 3000,
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
    PushNotifications: {
      presentationOptions: ['sound', 'alert'],
    },
  },
}

export default config
