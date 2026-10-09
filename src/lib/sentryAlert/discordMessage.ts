import type { SentryAlert } from '@/lib/sentryAlert/sentryEmail'

const SERVICE_NAME = 'Peakda'
// Discord 웹훅 content 최대 길이
const DISCORD_CONTENT_LIMIT = 2000
const TITLE_LIMIT = 200
const SUMMARY_LIMIT = 800

export interface DiscordWebhookPayload {
  content: string
  // 에러 메시지에 @everyone 같은 문자열이 섞여도 멘션이 울리지 않게 막는다.
  allowed_mentions: { parse: [] }
}

export function buildDiscordPayload(alert: SentryAlert): DiscordWebhookPayload {
  const header = [
    '🚨 **Sentry Error Alert**',
    '',
    `**Service:** ${SERVICE_NAME}${alert.project ? ` (${alert.project})` : ''}`,
    `**Env:** ${alert.environment}`,
    `**Title:** ${truncate(alert.title, TITLE_LIMIT)}`,
    `**Time:** ${formatKst(alert.receivedAt)}`,
    // <> 로 감싸면 링크 미리보기 카드가 붙지 않아 메시지가 짧게 유지된다.
    `**Link:** ${alert.issueUrl ? `<${alert.issueUrl}>` : '(본문에서 이슈 링크를 찾지 못함)'}`,
  ].join('\n')

  if (!alert.summary) return { content: header, allowed_mentions: { parse: [] } }

  const summaryPrefix = '\n\n**Summary:**\n```\n'
  const summarySuffix = '\n```'
  const budget = Math.min(
    SUMMARY_LIMIT,
    DISCORD_CONTENT_LIMIT - header.length - summaryPrefix.length - summarySuffix.length
  )
  // 요약 안의 ``` 가 코드 블록을 닫아버리지 않게 바꾼다.
  const summary = truncate(alert.summary.replace(/```/g, "'''"), budget)

  return {
    content: `${header}${summaryPrefix}${summary}${summarySuffix}`,
    allowed_mentions: { parse: [] },
  }
}

// 2026-10-09 14:30 KST
export function formatKst(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')} KST`
}

function truncate(text: string, limit: number): string {
  if (limit <= 0) return ''
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`
}
