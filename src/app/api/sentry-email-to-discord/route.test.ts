// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from './route'

const SECRET = 'test-secret'
const WEBHOOK = 'https://discord.com/api/webhooks/1/token'

const sentryEmail = {
  from: 'Sentry <noreply@md.getsentry.com>',
  subject: 'PEAKDA-WEB-1Z - TypeError: boom',
  body: 'Details\n-------\n\nhttps://peakda.sentry.io/issues/1/\n\n* environment = production',
  receivedAt: '2026-10-09T05:30:00.000Z',
}

const request = (body: unknown, token: string | null = SECRET) =>
  new Request('http://localhost/api/sentry-email-to-discord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('POST /api/sentry-email-to-discord', () => {
  const fetchMock = vi.fn()
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.stubEnv('SENTRY_ALERT_BRIDGE_SECRET', SECRET)
    vi.stubEnv('DISCORD_WEBHOOK_URL', WEBHOOK)
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }))
    errorSpy.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('비밀값이 없거나 틀리면 401 이고 Discord 를 호출하지 않는다', async () => {
    expect((await POST(request(sentryEmail, null))).status).toBe(401)
    expect((await POST(request(sentryEmail, 'wrong'))).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('환경변수가 없으면 500', async () => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', '')
    expect((await POST(request(sentryEmail))).status).toBe(500)
  })

  it('본문이 JSON 이 아니거나 필드가 빠지면 400', async () => {
    expect((await POST(request('not json'))).status).toBe(400)
    expect((await POST(request({ from: 'x', subject: 'y' }))).status).toBe(400)
  })

  it('Sentry 알림이 아니면 전송하지 않고 200 forwarded:false', async () => {
    const res = await POST(request({ ...sentryEmail, from: 'someone@example.com' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ forwarded: false, reason: 'not_sentry_alert' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Sentry 알림이면 웹훅으로 보낸다', async () => {
    const res = await POST(request(sentryEmail))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ forwarded: true })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(WEBHOOK)
    expect(JSON.parse(init.body).content).toContain('**Env:** production')
  })

  it('Discord 가 실패하면 502 를 주고 상태 코드는 남기되 웹훅 URL 은 로그에 쓰지 않는다', async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"rate limited"}', { status: 429 }))
    const res = await POST(request(sentryEmail))
    expect(res.status).toBe(502)
    const logged = errorSpy.mock.calls.flat().join(' ')
    expect(logged).toContain('429')
    expect(logged).not.toContain(WEBHOOK)
    expect(logged).not.toContain(SECRET)
  })

  it('Discord 가 내용을 거절(400)하면 재시도해도 같으므로 422', async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"Invalid Form Body"}', { status: 400 }))
    const res = await POST(request(sentryEmail))
    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({ error: 'discord_rejected', status: 400 })
  })

  it('웹훅 설정 오류(404)는 고치면 성공하므로 재시도용 502', async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"Unknown Webhook"}', { status: 404 }))
    expect((await POST(request(sentryEmail))).status).toBe(502)
  })

  it('네트워크 오류도 502', async () => {
    fetchMock.mockRejectedValue(new Error('fetch failed'))
    expect((await POST(request(sentryEmail))).status).toBe(502)
  })
})
