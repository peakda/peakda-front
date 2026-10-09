/**
 * Gmail 의 Sentry 알림 메일을 Peakda 의 /api/sentry-email-to-discord 로 보내는 Google Apps Script.
 * 앱 런타임에서 쓰지 않는다 — script.google.com 프로젝트에 그대로 붙여 넣어 쓴다.
 * 설정 방법: docs/SENTRY_DISCORD_ALERTS.md
 *
 * 스크립트 속성(프로젝트 설정 → 스크립트 속성):
 *   BRIDGE_URL     https://www.peakda.com/api/sentry-email-to-discord
 *   BRIDGE_SECRET  Vercel 의 SENTRY_ALERT_BRIDGE_SECRET 과 같은 값
 *   GMAIL_LABEL    (선택) Gmail 필터가 붙이는 라벨. 기본 sentry-alert
 */

const DEFAULT_LABEL = 'sentry-alert'
// 같은 Sentry 이슈는 이 시간 안에 한 번만 보낸다.
const DEDUPE_SECONDS = 10 * 60
// 한 번 실행에서 보낼 최대 메일 수 (나머지는 다음 실행에서 이어 보낸다)
const MAX_PER_RUN = 20

function forwardSentryEmails() {
  const props = PropertiesService.getScriptProperties()
  const url = props.getProperty('BRIDGE_URL')
  const secret = props.getProperty('BRIDGE_SECRET')
  if (!url || !secret) throw new Error('스크립트 속성 BRIDGE_URL / BRIDGE_SECRET 이 없습니다')
  const label = props.getProperty('GMAIL_LABEL') || DEFAULT_LABEL

  // 이전 실행이 아직 끝나지 않았으면 겹쳐 돌지 않는다.
  const lock = LockService.getScriptLock()
  if (!lock.tryLock(1000)) return

  try {
    // 마지막으로 처리한 메일의 수신 시각. 처음 실행하면 지금부터 받는다(과거 메일을 한꺼번에 보내지 않게).
    let watermark = Number(props.getProperty('LAST_PROCESSED_AT'))
    if (!watermark) {
      props.setProperty('LAST_PROCESSED_AT', String(Date.now()))
      return
    }

    // Gmail 라벨은 스레드 단위라 "처리됨" 라벨 대신 수신 시각으로 이어 받는다.
    // after: 는 초 단위이므로 같은 초의 메일은 아래 getDate() 비교로 한 번 더 거른다.
    const query = 'label:' + label + ' after:' + Math.floor(watermark / 1000)
    const messages = GmailApp.search(query, 0, 50)
      .flatMap((thread) => thread.getMessages())
      .filter((message) => message.getDate().getTime() > watermark)
      .sort((a, b) => a.getDate().getTime() - b.getDate().getTime())
      .slice(0, MAX_PER_RUN)

    const cache = CacheService.getScriptCache()

    for (const message of messages) {
      const body = message.getPlainBody()
      const issueKey = extractIssueKey(body)

      if (issueKey && cache.get(issueKey)) {
        watermark = message.getDate().getTime()
        continue
      }

      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + secret },
        payload: JSON.stringify({
          from: message.getFrom(),
          subject: message.getSubject(),
          body: body,
          receivedAt: message.getDate().toISOString(),
        }),
        muteHttpExceptions: true,
      })
      const status = res.getResponseCode()

      // 설정 오류(401)·Discord 실패(502)·서버 오류는 멈추고 다음 실행에서 같은 메일부터 다시 시도한다.
      if (status === 401 || status === 429 || status >= 500) {
        console.error('bridge 응답 ' + status + ' — 다음 실행에서 재시도')
        break
      }
      // 그 밖의 4xx — 400(본문 형식 오류)·422(Discord 가 내용을 거절)는 다시 보내도 같으므로 건너뛴다.
      // 여기서 멈추면 이 메일 하나 때문에 뒤의 알림이 모두 막힌다.
      if (status >= 400) console.warn('bridge 응답 ' + status + ' — 이 메일은 건너뜀')

      if (issueKey && status < 300) cache.put(issueKey, '1', DEDUPE_SECONDS)
      watermark = message.getDate().getTime()
    }

    props.setProperty('LAST_PROCESSED_AT', String(watermark))
  } finally {
    lock.releaseLock()
  }
}

// https://<org>.sentry.io/issues/123456/?... → "issue:123456"
function extractIssueKey(body) {
  const match = body.match(/sentry\.io\/[^\s<>"']*?issues\/(\d+)/)
  return match ? 'issue:' + match[1] : null
}

// 1분마다 forwardSentryEmails 를 돌리는 트리거를 만든다. 여러 번 실행해도 트리거는 하나만 남는다.
function install() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'forwardSentryEmails')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger))
  ScriptApp.newTrigger('forwardSentryEmails').timeBased().everyMinutes(1).create()
}

// 메일 없이 bridge → Discord 경로만 확인한다. 실행 로그에 응답 코드가 찍힌다.
function testBridge() {
  const props = PropertiesService.getScriptProperties()
  const res = UrlFetchApp.fetch(props.getProperty('BRIDGE_URL'), {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + props.getProperty('BRIDGE_SECRET') },
    payload: JSON.stringify({
      from: 'Sentry <noreply@md.getsentry.com>',
      subject: 'PEAKDA-TEST-1 - Error: Apps Script 연결 테스트',
      body: 'Details\n-------\n\nhttps://example.sentry.io/issues/1/\n\n* environment = development\n\nError: Apps Script 연결 테스트',
      receivedAt: new Date().toISOString(),
    }),
    muteHttpExceptions: true,
  })
  console.log(res.getResponseCode() + ' ' + res.getContentText())
}
