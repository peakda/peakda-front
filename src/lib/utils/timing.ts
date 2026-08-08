import type { BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

export type TimingKey = 'PEAK_NOW' | 'STARTING' | 'EARLY'

export interface TimingMeta {
  key: TimingKey
  label: string
  subLabel: string
  /** 오늘부터 며칠 뒤를 방문예정일로 볼지. 0 이면 오늘(=date 미전송) */
  offsetDays: number
}

/**
 * 시기 탭은 "지금 어떤 상태냐"가 아니라 **언제 갈 거냐**를 고른다.
 * 고른 날짜를 `GET /api/seasonal/blooms` 의 `date` 로 보내면 서버가 그날 기준으로
 * 명소형 핀 상태를 재계산해 주고, 프론트는 그중 절정만 남긴다.
 */
export const TIMINGS: TimingMeta[] = [
  { key: 'PEAK_NOW', label: '절정', subLabel: '지금 피크에요!', offsetDays: 0 },
  { key: 'STARTING', label: '피기시작', subLabel: '1~2주 내 절정', offsetDays: 10 },
  { key: 'EARLY', label: '이르다', subLabel: '미리 계획 중', offsetDays: 25 },
]

const TIMING_BY_KEY = new Map(TIMINGS.map((t) => [t.key, t]))

// 브라우저 로컬 타임존으로 계산하면 해외 접속 시 하루 어긋나므로 KST 로 고정한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 시기 탭 → `date` 쿼리 값(`YYYY-MM-DD`, KST 기준).
 * 오늘이면 undefined 를 돌려줘 파라미터 자체를 빼고 서버 기본값(오늘)에 맡긴다.
 */
export function timingToDate(timing: TimingKey | null, now: number = Date.now()) {
  const offsetDays = timing ? (TIMING_BY_KEY.get(timing)?.offsetDays ?? 0) : 0
  if (offsetDays === 0) return undefined

  // KST 로 민 시각의 UTC 표기를 자르면 KST 기준 날짜가 된다.
  return new Date(now + KST_OFFSET_MS + offsetDays * DAY_MS).toISOString().slice(0, 10)
}

/**
 * 시기 탭 → 클라이언트에서 남길 개화 상태.
 * date 로 그날 상태를 이미 재계산받으므로 어떤 탭이든 "그날 절정"만 남기면 된다.
 */
export function timingToStatuses(timing: TimingKey | null): BloomSlotStatus[] {
  return timing ? ['PEAK'] : []
}

/**
 * 미래 날짜 조회인지. 동네형(LOCAL) 핀은 관측값이라 날짜 투영이 안 되므로
 * (서버 스펙: "동네형은 최근 관측값 유지") 이때는 명소형만 보여줘야 한다.
 */
export function isFutureTiming(timing: TimingKey | null) {
  return timingToDate(timing) !== undefined
}
