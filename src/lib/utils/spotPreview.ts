import type { SpotPreviewItem } from '@/api/facades/generated/peakdaApi.schemas'
import type { MultiImageProps } from '@/types/types'
import { CATEGORY_ICON, STAGE_LABEL, STATUS_STAGE } from '@/constants/map'

// 카드가 3칸 그리드라 3장까지만 쓴다(서버는 최대 4장을 준다).
const MAX_PHOTOS = 3

/** 핀 프리뷰 카드 → 드로어의 PinList props */
export function toPinListItems(items: SpotPreviewItem[]): MultiImageProps[] {
  return items.map((item) => {
    // status 로 거르면 서버가 badges 도 함께 좁혀 준다. 첫 배지를 대표로 쓴다.
    // (칩을 여러 개 띄우려면 PinText 가 배지마다 다른 아이콘을 받아야 한다)
    const badge = item.badges[0] ?? null

    return {
      type: 'list' as const,
      spotId: item.spotId,
      title: item.name,
      location: item.address ?? '',
      description: badge?.displayName ?? '',
      tagText: badge ? STAGE_LABEL[STATUS_STAGE[badge.status]] : undefined,
      badgeIcon: badge ? CATEGORY_ICON[badge.category] : undefined,
      Badges: badge ? [badge.displayName] : [],
      isFavorite: item.favorited,
      images: item.photoUrls.slice(0, MAX_PHOTOS),
    }
  })
}
