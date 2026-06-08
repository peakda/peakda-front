import type { SpotRecordSummaryResponse } from '@/api/generated/peakdaApi.schemas'
import type { FeedCardProps } from '@/components/ui/card/FeedCard'

const BLOOM_LABEL = {
  EARLY: '이르다',
  STARTING: '피기 시작',
  PEAK: '절정',
  LATE: '늦었다',
} as const

const BLOOM_VARIANT: Record<keyof typeof BLOOM_LABEL, FeedCardProps['statusVariant']> = {
  EARLY: 'green',
  STARTING: 'green',
  PEAK: 'bloom',
  LATE: 'secondary',
}

// ISO 문자열(날짜/일시) → 'YYYY.MM.DD'
const toDot = (iso: string) => iso.slice(0, 10).replaceAll('-', '.')

// 게시/생성 시각 → 상대 시간 (7일 이상은 날짜로 표기)
function formatTimeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return toDot(iso)
}

// SpotRecordSummaryResponse → FeedCard props
// 한계: 요약 응답에는 식물 이모지·리액션 정보가 없어 기본값(🌸 / 빈 배열)을 사용한다.
// 대표 사진이 없으면 placeholder 이미지를 사용한다.
export function toFeedCardProps(record: SpotRecordSummaryResponse): FeedCardProps {
  return {
    authorName: record.user.nickname,
    location: record.spotName,
    timeAgo: formatTimeAgo(record.publishedAt ?? record.createdAt),
    visitDate: toDot(record.visitedDate ?? record.createdAt),
    statusLabel: record.bloomStage ? BLOOM_LABEL[record.bloomStage] : '상태 미정',
    statusVariant: record.bloomStage ? BLOOM_VARIANT[record.bloomStage] : 'secondary',
    images: record.coverPhoto?.url ? [record.coverPhoto.url] : ['/images/explore.png'],
    flowers: record.plants.map((plant) => ({ emoji: '🌸', label: plant.name })),
    content: record.memo ?? '',
    reactions: [],
  }
}
