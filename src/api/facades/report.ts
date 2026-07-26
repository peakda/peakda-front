import { create1, useCreate1 as useReportGen } from '@/api/facades/generated/report/report'
import type { CreateReportRequest } from '@/api/facades/generated/peakdaApi.schemas'

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function reportApi(payload: CreateReportRequest) {
  await create1(payload)
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// mutate({ data: payload }) 형태로 호출. 무효화할 캐시 없음(단발성 신고).
export const useReport = () => useReportGen()
