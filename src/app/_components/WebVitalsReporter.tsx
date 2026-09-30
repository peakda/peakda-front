'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { track } from '@/lib/analytics'

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0]

// 콜백 참조가 바뀌면 다시 구독하므로 컴포넌트 밖에 둔다.
// GA 태그는 운영 배포에서만 로드되므로 로컬·프리뷰에서는 track 이 조용히 버린다.
const report: ReportWebVitalsCallback = (metric) => {
  track('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  })
}

export function WebVitalsReporter() {
  useReportWebVitals(report)
  return null
}
