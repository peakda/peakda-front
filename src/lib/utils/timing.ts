import type { BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

export type TimingKey = 'PEAK_NOW' | 'STARTING' | 'EARLY'

export interface TimingMeta {
  key: TimingKey
  label: string
  subLabel: string
  /** 이 탭이 고르는 개화 상태 — 서버 status 파라미터로 그대로 나간다 */
  status: BloomSlotStatus
}

/**
 * 시기 탭은 "언제 갈 거냐"가 아니라 **지금 어떤 상태냐**를 고른다.
 *
 * 이전에는 탭을 방문예정일로 바꿔 `date` 로 보냈는데, 서버가 명소형만 그날 기준으로
 * 재계산하고 동네형은 최근 관측값을 유지해서 한 지도에 두 기준이 섞였다.
 * `status` 는 명소형 추정과 동네형 관측에 같은 축으로 적용되므로 그 제약이 없다.
 */
export const TIMINGS: TimingMeta[] = [
  { key: 'PEAK_NOW', label: '절정', subLabel: '지금 피크에요!', status: 'PEAK' },
  { key: 'STARTING', label: '피기시작', subLabel: '1~2주 내 절정', status: 'STARTED' },
  { key: 'EARLY', label: '이르다', subLabel: '미리 계획 중', status: 'PREPARING' },
]

const TIMING_BY_KEY = new Map(TIMINGS.map((t) => [t.key, t]))

/** 시기 탭 → 서버 `status` 파라미터. 고른 게 없으면 보내지 않는다. */
export function timingToStatus(timing: TimingKey | null): BloomSlotStatus | undefined {
  return timing ? TIMING_BY_KEY.get(timing)?.status : undefined
}

/**
 * 시기 탭 → 클라이언트에서 남길 개화 상태.
 *
 * 서버가 이미 status 로 걸러 주는데도 클라 필터가 필요하다. 서버 판정은 **핀 단위**라
 * "그 상태인 꽃이 하나라도 있는 핀"을 주는데, 꽃 종류를 함께 고르면 그중 고른 꽃이
 * 그 상태여야 한다. 그 판정은 꽃을 좁힌 뒤에만 가능하므로 mapFilter 가 맡는다.
 */
export function timingToStatuses(timing: TimingKey | null): BloomSlotStatus[] {
  const status = timingToStatus(timing)
  return status ? [status] : []
}
