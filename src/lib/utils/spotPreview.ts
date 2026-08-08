import type { SpotPreviewItem } from '@/api/facades/generated/peakdaApi.schemas'
import type { MultiImageProps } from '@/types/types'
import { CATEGORY_ICON, STAGE_LABEL, STATUS_STAGE } from '@/constants/map'

/**
 * 거리(m) → 표시 문자열. 좌표를 안 보내면 서버가 null 을 주므로 그때는 빈 문자열.
 * 0 은 "모름"이 아니라 "바로 여기"라 그대로 표시한다.
 */
export function formatDistance(meters?: number | null): string {
  if (meters == null) return ''
  if (meters < 1000) return `${Math.round(meters)}m`

  const km = meters / 1000
  // 15.0km 처럼 의미 없는 0 은 떼고 보여준다.
  return `${Number(km.toFixed(1))}km`
}

/** 핀 프리뷰 카드 → 드로어의 PinList props */
export function toPinListItems(items: SpotPreviewItem[]): MultiImageProps[] {
  return items.map((item) => {
    const badge = item.badge ?? null

    return {
      type: 'list' as const,
      spotId: item.spotId,
      title: item.name,
      // 프리뷰 응답에는 주소가 없어 위치 자리에 거리를 넣는다.
      location: formatDistance(item.distanceMeters),
      description: badge?.displayName ?? '',
      tagText: badge ? STAGE_LABEL[STATUS_STAGE[badge.status]] : undefined,
      badgeIcon: badge ? CATEGORY_ICON[badge.category] : undefined,
      Badges: badge ? [badge.displayName] : [],
      // 프리뷰 응답에 찜 상태가 없다. 백엔드에 favorited 추가를 요청해 둔 상태.
      isFavorite: false,
      images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
    }
  })
}
