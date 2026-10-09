// Gmail 로 받은 Sentry 알림 메일(텍스트 본문)을 Discord 로 보낼 필드로 해석한다.
// 형식 근거: 제목 기본값은 `$shortID - $title`(예: "PEAKDA-WEB-1Z - TypeError: ..."), 프로젝트별 접두어가 붙을 수 있다.
// 본문은 Sentry 의 sentry/emails/error.txt — 이슈 링크, `* key = value` 태그 목록, 예외 본문 순서다.

export interface SentryEmail {
  from: string
  subject: string
  body: string
  // 메일 수신 시각(ISO 8601). 없으면 요청을 받은 시각을 쓴다.
  receivedAt?: string
}

export interface SentryAlert {
  title: string
  // 이슈 short ID 에서 번호를 뗀 프로젝트 이름 (예: PEAKDA-WEB-1Z → PEAKDA-WEB)
  project?: string
  environment: string
  issueUrl?: string
  summary: string
  receivedAt: Date
}

// 본문이 비정상적으로 길어도 정규식이 훑는 범위를 제한한다.
const MAX_BODY_LENGTH = 20_000

const SUBJECT_KEYWORDS = /\[sentry\]|issue|alert|error|regression|exception/i
// "PEAKDA-WEB-1Z - 제목"
const SHORT_ID_SUBJECT = /^([A-Z0-9][A-Z0-9_-]*)-([A-Z0-9]+)\s+-\s+(.+)$/
const ISSUE_URL = /https?:\/\/[^\s<>"')\]]*sentry\.io\/[^\s<>"')\]]*issues\/\d+[^\s<>"')\]]*/i
const TAG_LINE = /^\*\s+([\w.:-]+)\s+=\s+(.*)$/

export function isSentryEmail({ from, subject }: SentryEmail): boolean {
  if (!/sentry/i.test(from)) return false
  return SUBJECT_KEYWORDS.test(subject) || SHORT_ID_SUBJECT.test(stripSubjectPrefix(subject))
}

export function parseSentryEmail(email: SentryEmail): SentryAlert {
  const body = email.body.slice(0, MAX_BODY_LENGTH).replace(/\r\n/g, '\n')
  const lines = body.split('\n').map((line) => line.trim())
  const tags = parseTags(lines)
  const issueUrl = body.match(ISSUE_URL)?.[0]

  const subject = stripSubjectPrefix(email.subject.trim())
  const shortId = subject.match(SHORT_ID_SUBJECT)
  const title = shortId?.[3] ?? subject

  const receivedAt = email.receivedAt ? new Date(email.receivedAt) : new Date()

  return {
    title: title || '(제목 없음)',
    project: shortId?.[1],
    environment: tags.environment ?? environmentFromUrl(issueUrl) ?? 'unknown',
    issueUrl,
    summary: summarize(lines),
    receivedAt: Number.isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
  }
}

// "[Sentry] ", "[peakda] " 같은 대괄호 접두어를 뗀다.
function stripSubjectPrefix(subject: string): string {
  return subject.replace(/^(\[[^\]]*\]\s*)+/, '')
}

function parseTags(lines: string[]): Record<string, string> {
  const tags: Record<string, string> = {}
  for (const line of lines) {
    const match = line.match(TAG_LINE)
    if (match) tags[match[1]] = match[2].trim()
  }
  return tags
}

// 태그가 없으면(Enhanced Privacy 등) 이슈 링크의 ?environment= 를 쓴다.
function environmentFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).searchParams.get('environment') ?? undefined
  } catch {
    return undefined
  }
}

// 링크·구분선·태그·수신거부 줄을 걷어낸 나머지(주로 예외 메시지와 스택)를 요약으로 쓴다.
function summarize(lines: string[]): string {
  const kept = lines.filter(
    (line) =>
      line !== 'Details' &&
      !/^-+$/.test(line) &&
      !/^https?:\/\//.test(line) &&
      !/^unsubscribe:/i.test(line) &&
      !TAG_LINE.test(line) &&
      line !== 'Tags'
  )
  return kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
