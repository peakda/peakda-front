// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { Capacitor } from '@capacitor/core'
import { ApiError } from '@/lib/utils/apiError'

Sentry.init({
  dsn: 'https://b943a12dd1dcf7d0779801d718b97a9a@o4512224525418496.ingest.de.sentry.io/4512224531382352',

  // 개발 중 에러로 쿼터를 쓰지 않도록 프로덕션 빌드에서만 보낸다
  enabled: process.env.NODE_ENV === 'production',

  // Vercel 밖(로컬 pnpm build)에서는 SDK 기본값이 'production' 이라 운영 이슈와 섞인다
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local',

  // 안드로이드 앱 WebView 도 같은 번들을 띄우므로 태그로 구분한다
  initialScope: { tags: { platform: Capacitor.isNativePlatform() ? 'android-app' : 'web' } },

  // 4xx 는 401 refresh·404 같은 정상 흐름이라 노이즈. 서버 실패(5xx)만 남긴다
  beforeSend(event, hint) {
    const error = hint.originalException
    if (error instanceof ApiError && error.response.status < 500) return null
    return event
  },

  // Turns off collection of data that could identify users. Adjust per category:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
  dataCollection: {
    userInfo: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    httpBodies: [],
    httpHeaders: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    cookies: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
  },
})
