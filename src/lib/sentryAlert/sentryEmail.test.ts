import { describe, it, expect } from 'vitest'
import { isSentryEmail, parseSentryEmail, type SentryEmail } from './sentryEmail'

// Sentry sentry/emails/error.txt 템플릿 모양을 따른 텍스트 본문
const BODY = [
  'Details',
  '-------',
  '',
  'https://peakda.sentry.io/issues/123456/?referrer=alert_email&environment=production',
  '',
  'Tags',
  '----',
  '',
  '* environment = production',
  '* level = error',
  '* url = https://www.peakda.com/map',
  '',
  'Exception',
  '-----------',
  '',
  "TypeError: Cannot read properties of undefined (reading 'lat')",
  '  at MapContainer (app/map/page.tsx:12:3)',
  '',
  'Unsubscribe: https://peakda.sentry.io/unsubscribe/abc',
].join('\n')

const email = (overrides: Partial<SentryEmail> = {}): SentryEmail => ({
  from: 'Sentry <noreply@md.getsentry.com>',
  subject: "PEAKDA-WEB-1Z - TypeError: Cannot read properties of undefined (reading 'lat')",
  body: BODY,
  receivedAt: '2026-10-09T05:30:00.000Z',
  ...overrides,
})

describe('lib/sentryAlert/sentryEmail', () => {
  describe('isSentryEmail', () => {
    it('발신자에 sentry 가 있고 제목이 short ID 형식이거나 키워드를 담으면 알림으로 본다', () => {
      expect(isSentryEmail(email())).toBe(true)
      expect(isSentryEmail(email({ subject: 'PEAKDA-WEB-2 - Something went wrong' }))).toBe(true)
      expect(isSentryEmail(email({ subject: '[Sentry] Regression detected' }))).toBe(true)
    })

    it('발신자가 Sentry 가 아니면 제목이 그럴듯해도 거른다', () => {
      expect(isSentryEmail(email({ from: 'attacker@example.com' }))).toBe(false)
    })

    it('Sentry 메일이라도 주간 리포트처럼 알림이 아닌 제목은 거른다', () => {
      expect(isSentryEmail(email({ subject: 'Weekly Report for peakda: Oct 1 - Oct 8' }))).toBe(
        false
      )
    })
  })

  describe('parseSentryEmail', () => {
    it('제목에서 short ID 를 떼 제목·프로젝트를 나누고 본문에서 환경·링크를 읽는다', () => {
      const alert = parseSentryEmail(email())
      expect(alert.title).toBe("TypeError: Cannot read properties of undefined (reading 'lat')")
      expect(alert.project).toBe('PEAKDA-WEB')
      expect(alert.environment).toBe('production')
      expect(alert.issueUrl).toBe(
        'https://peakda.sentry.io/issues/123456/?referrer=alert_email&environment=production'
      )
      expect(alert.receivedAt.toISOString()).toBe('2026-10-09T05:30:00.000Z')
    })

    it('요약에는 링크·태그·구분선·수신거부 줄이 빠지고 예외 본문이 남는다', () => {
      const { summary } = parseSentryEmail(email())
      expect(summary).toContain("TypeError: Cannot read properties of undefined (reading 'lat')")
      expect(summary).toContain('at MapContainer')
      expect(summary).not.toContain('https://')
      expect(summary).not.toContain('environment = production')
      expect(summary).not.toMatch(/Unsubscribe/i)
    })

    it('[Sentry] 같은 접두어는 제목에서 뗀다', () => {
      const alert = parseSentryEmail(email({ subject: '[Sentry] PEAKDA-WEB-3 - Boom' }))
      expect(alert.title).toBe('Boom')
      expect(alert.project).toBe('PEAKDA-WEB')
    })

    it('태그가 없으면 링크의 environment 쿼리, 그것도 없으면 unknown', () => {
      const urlOnly = 'Details\n-------\n\nhttps://peakda.sentry.io/issues/9/?environment=preview'
      expect(parseSentryEmail(email({ body: urlOnly })).environment).toBe('preview')
      expect(parseSentryEmail(email({ body: 'no details' })).environment).toBe('unknown')
    })

    it('short ID 형식이 아닌 제목은 통째로 제목으로 쓴다', () => {
      const alert = parseSentryEmail(email({ subject: 'Alert: high error rate' }))
      expect(alert.title).toBe('Alert: high error rate')
      expect(alert.project).toBeUndefined()
    })

    it('receivedAt 이 잘못된 값이면 현재 시각으로 대신한다', () => {
      const alert = parseSentryEmail(email({ receivedAt: 'not-a-date' }))
      expect(Number.isNaN(alert.receivedAt.getTime())).toBe(false)
    })
  })
})
