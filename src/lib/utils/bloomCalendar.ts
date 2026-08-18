import type {
  BloomCalendarDay,
  BloomCalendarResponse,
  BloomCalendarResponseCategory,
} from '@/api/facades/generated/peakdaApi.schemas'

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

export const BLOOM_CATEGORY_EMOJI: Record<BloomCalendarResponseCategory, string> = {
  PLUM: '🌸',
  FORSYTHIA: '🌼',
  AZALEA_KR: '🌺',
  CHERRY: '🌸',
  CANOLA: '🌻',
  AZALEA: '🌺',
  HYDRANGEA: '💐',
  LOTUS: '🪷',
  SUNFLOWER: '🌻',
  COSMOS: '🌸',
  CHRYSANTHEMUM: '🌼',
  PINK_MUHLY: '🌸',
  SILVERGRASS: '🍂',
  MAPLE: '🍁',
  CAMELLIA: '🌹',
}

// 'YYYY-MM-DD'(또는 일시) → 로컬 Date. new Date(iso) 는 날짜만 오면 UTC 로 읽어
// KST 기준 하루가 밀리므로 직접 분해한다.
function parseDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

// 'YYYY-MM-DD' → 'M.D(요일)'
export function formatBloomDate(iso: string): string {
  const date = parseDate(iso)
  return `${date.getMonth() + 1}.${date.getDate()}(${WEEKDAY[date.getDay()]})`
}

// 절정 구간 → '3.28(토) ~ 4.5(일)'. 한쪽만 있으면 그쪽만, 둘 다 없으면 빈 문자열.
export function formatPeakPeriod(start?: string | null, end?: string | null): string {
  if (start && end) return `${formatBloomDate(start)} ~ ${formatBloomDate(end)}`
  if (start) return `${formatBloomDate(start)} ~`
  if (end) return `~ ${formatBloomDate(end)}`
  return ''
}

// 타임라인에서 특정 날짜의 예상 상태를 찾는다. days 는 오늘부터 시작하지만
// 응답 기준일이 밀릴 수 있어 날짜 매칭에 실패하면 첫 항목으로 대체한다.
export function bloomStatusOn(days: BloomCalendarDay[], date: Date) {
  const key = toKey(date)
  return days.find((day) => day.date.slice(0, 10) === key)?.status ?? days[0]?.status ?? null
}

// 오늘 포함 7일 안의 토·일 중 절정인 날이 있는지. '이번 주말이 딱이에요' 판정용.
function hasPeakOnUpcomingWeekend(days: BloomCalendarDay[], today: Date): boolean {
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
    const weekday = date.getDay()
    if (weekday !== 0 && weekday !== 6) continue
    if (bloomStatusOn(days, date) === 'PEAK') return true
  }
  return false
}

// 날짜 차이(일). 시각은 무시한다.
function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
  return Math.round((b - a) / 86400000)
}

type PeakHeadlineInput = Pick<BloomCalendarResponse, 'days'> &
  Partial<Pick<BloomCalendarResponse, 'peakStartDate'>>

// 캘린더 타임라인 → 초록 배너 문구.
// 주말 추천을 가장 먼저 보는 이유: 여행 계획은 주말 단위라 '3일 뒤' 보다 행동에 옮기기 쉽다.
export function peakHeadline(calendar: PeakHeadlineInput, today: Date = new Date()): string {
  if (hasPeakOnUpcomingWeekend(calendar.days, today)) return '이번 주말이 딱이에요'

  const status = bloomStatusOn(calendar.days, today)
  if (status === 'PEAK') return '지금이 절정이에요'

  if (calendar.peakStartDate) {
    const left = daysBetween(today, parseDate(calendar.peakStartDate))
    if (left > 0) return `${left}일 뒤 절정이 시작돼요`
  }

  if (status === 'ENDED') return '올해 절정은 지났어요'
  if (status === 'STARTED') return '이제 막 피기 시작했어요'
  return '곧 피기 시작해요'
}
