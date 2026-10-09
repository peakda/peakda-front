// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://b943a12dd1dcf7d0779801d718b97a9a@o4512224525418496.ingest.de.sentry.io/4512224531382352',

  // 개발 중 에러로 쿼터를 쓰지 않도록 프로덕션 빌드에서만 보낸다
  enabled: process.env.NODE_ENV === 'production',

  // Vercel 밖(로컬 pnpm build)에서는 SDK 기본값이 'production' 이라 운영 이슈와 섞인다
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local',

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
