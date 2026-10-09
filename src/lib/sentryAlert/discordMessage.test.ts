import { describe, it, expect } from 'vitest'
import { buildDiscordPayload, formatKst } from './discordMessage'
import type { SentryAlert } from '@/lib/sentryAlert/sentryEmail'

const alert = (overrides: Partial<SentryAlert> = {}): SentryAlert => ({
  title: 'TypeError: Cannot read properties of undefined',
  project: 'PEAKDA-WEB',
  environment: 'production',
  issueUrl: 'https://peakda.sentry.io/issues/123456/',
  summary: 'TypeError: Cannot read properties of undefined',
  receivedAt: new Date('2026-10-09T05:30:00.000Z'),
  ...overrides,
})

describe('lib/sentryAlert/discordMessage', () => {
  it('formatKst 는 KST(UTC+9) 기준 분 단위로 쓴다', () => {
    expect(formatKst(new Date('2026-10-09T05:30:00.000Z'))).toBe('2026-10-09 14:30 KST')
    expect(formatKst(new Date('2026-10-09T15:05:00.000Z'))).toBe('2026-10-10 00:05 KST')
  })

  it('서비스·환경·제목·시각·링크·요약을 담고 멘션은 막는다', () => {
    const { content, allowed_mentions } = buildDiscordPayload(alert())
    expect(content).toContain('**Service:** Peakda (PEAKDA-WEB)')
    expect(content).toContain('**Env:** production')
    expect(content).toContain('**Title:** TypeError: Cannot read properties of undefined')
    expect(content).toContain('**Time:** 2026-10-09 14:30 KST')
    expect(content).toContain('**Link:** <https://peakda.sentry.io/issues/123456/>')
    expect(content).toContain('**Summary:**')
    expect(allowed_mentions).toEqual({ parse: [] })
  })

  it('긴 본문은 잘라 Discord 2000자 제한 안에 맞춘다', () => {
    const { content } = buildDiscordPayload(
      alert({ title: 'x'.repeat(1000), summary: 'y'.repeat(5000) })
    )
    expect(content.length).toBeLessThanOrEqual(2000)
    expect(content).toContain('…')
    expect(content.endsWith('```')).toBe(true)
  })

  it('요약 속 ``` 는 코드 블록을 깨지 않게 바꾼다', () => {
    const { content } = buildDiscordPayload(alert({ summary: 'a```b' }))
    expect(content).toContain("a'''b")
  })

  it('요약이 없으면 Summary 블록을 생략한다', () => {
    expect(buildDiscordPayload(alert({ summary: '' })).content).not.toContain('Summary')
  })
})
