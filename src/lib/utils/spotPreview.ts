import type { SpotPreviewItem } from '@/api/facades/generated/peakdaApi.schemas'
import type { MultiImageProps } from '@/types/types'
import { CATEGORY_ICON, STAGE_LABEL, STATUS_STAGE } from '@/constants/map'

// 카드가 4칸 그리드다. 서버도 최대 4장을 준다.
const MAX_PHOTOS = 4

/** 핀 프리뷰 카드 → 드로어의 PinList props */
export function toPinListItems(items: SpotPreviewItem[]): MultiImageProps[] {
  return items.map((item) => {
    // 꽃 필터를 걸면 서버가 badges 를 고른 꽃으로 좁혀 준다. 여러 개면 전부 칩으로 띄운다.
    // 제목 옆 상태 태그는 하나뿐이라 첫 배지를 대표로 쓴다.
    const primary = item.badges[0] ?? null

    return {
      type: 'list' as const,
      spotId: item.spotId,
      title: item.name,
      location: item.address ?? '',
      description: primary?.displayName ?? '',
      tagText: primary ? STAGE_LABEL[STATUS_STAGE[primary.status]] : undefined,
      badges: item.badges.map((badge) => ({
        label: badge.displayName,
        icon: CATEGORY_ICON[badge.category],
      })),
      isFavorite: item.favorited,
      images: item.photoUrls.slice(0, MAX_PHOTOS),
    }
  })
}
