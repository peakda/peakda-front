import { createHash, timingSafeEqual } from 'crypto'
import { buildDiscordPayload } from '@/lib/sentryAlert/discordMessage'
import { isSentryEmail, parseSentryEmail, type SentryEmail } from '@/lib/sentryAlert/sentryEmail'

// Gmail 에 도착한 Sentry 알림 메일을 Discord 채널로 전달한다.
// 호출자는 Google Apps Script(scripts/gmail-sentry-forwarder.gs)이고, 설정은 docs/SENTRY_DISCORD_ALERTS.md.
// 백엔드 프록시가 아니라 외부 웹훅 중계라서 customInstance 를 거치지 않는다.
// POST 만 export 하므로 다른 메서드는 Next 가 405 로 응답한다.

const LOG_PREFIX = '[sentry-email-to-discord]'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.SENTRY_ALERT_BRIDGE_SECRET
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!secret || !webhookUrl) {
    console.error(
      `${LOG_PREFIX} SENTRY_ALERT_BRIDGE_SECRET 또는 DISCORD_WEBHOOK_URL 이 설정되지 않았다`
    )
    return Response.json({ error: 'not_configured' }, { status: 500 })
  }

  if (!isAuthorized(request.headers.get('authorization'), secret)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }
  if (!isSentryEmailPayload(body)) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 })
  }

  // Gmail 필터에 다른 메일이 섞여도 실패로 보지 않는다 — 호출자가 같은 메일을 계속 재시도하지 않게 200.
  if (!isSentryEmail(body)) {
    return Response.json({ forwarded: false, reason: 'not_sentry_alert' })
  }

  const payload = buildDiscordPayload(parseSentryEmail(body))

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      // Discord 에러 본문({ message, code })만 남긴다. 웹훅 URL·메일 원문은 로그에 쓰지 않는다.
      const detail = (await res.text()).slice(0, 300)
      console.error(`${LOG_PREFIX} Discord 전송 실패: ${res.status} ${detail}`)
      // 400 은 이 메시지 내용 자체를 Discord 가 거절한 것이라 다시 보내도 같다 → 422 로 답해 호출자가 건너뛰게 한다.
      // 그 밖(401·404 웹훅 설정 오류, 429, 5xx)은 고치거나 기다리면 성공하므로 502 로 답해 재시도하게 한다.
      if (res.status === 400) {
        return Response.json({ error: 'discord_rejected', status: res.status }, { status: 422 })
      }
      return Response.json({ error: 'discord_failed', status: res.status }, { status: 502 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(`${LOG_PREFIX} Discord 요청 오류: ${message}`)
    return Response.json({ error: 'discord_unreachable' }, { status: 502 })
  }

  return Response.json({ forwarded: true })
}

// "Authorization: Bearer <secret>". 길이가 달라도 같은 시간에 비교하도록 해시끼리 비교한다.
function isAuthorized(header: string | null, secret: string): boolean {
  const token = header?.match(/^Bearer\s+(.+)$/)?.[1]
  if (!token) return false
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(token), digest(secret))
}

function isSentryEmailPayload(value: unknown): value is SentryEmail {
  if (typeof value !== 'object' || value === null) return false
  if (!('from' in value) || typeof value.from !== 'string') return false
  if (!('subject' in value) || typeof value.subject !== 'string') return false
  if (!('body' in value) || typeof value.body !== 'string') return false
  return (
    !('receivedAt' in value) ||
    value.receivedAt === undefined ||
    typeof value.receivedAt === 'string'
  )
}
