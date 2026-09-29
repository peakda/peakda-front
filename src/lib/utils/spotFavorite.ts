import type { SPOTProps } from '@/app/search/_components/SpotPanel'
import type { SpotFavoriteResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { toStatusBadge } from '@/lib/utils/bloomStatus'
import { CATEGORY_ICON } from '@/constants/map'

// 찜한 스팟 → SpotCard props.
// 썸네일은 최근 게시 기록 사진(photoUrls) 중 첫 장, 꽃 태그는 categories 의 표시명을 쓴다.
// bloom 은 명소형만 채워지고 동네 스팟은 null 이라 이때 배지는 표시되지 않는다.
export const toFavoriteSpotProps = (fav: SpotFavoriteResponse): SPOTProps => ({
  id: fav.spotId,
  name: fav.name,
  location: fav.address ?? '',
  imageUrl: fav.photoUrls[0] ?? null,
  ...toStatusBadge(fav.bloom?.status),
  tags: fav.categories.map((category) => ({
    label: category.displayName,
    icon: CATEGORY_ICON[category.category],
  })),
  // 찜 목록에서 온 항목이라 찜 상태는 항상 true 다.
  favorited: true,
  notifyEnabled: fav.notifyEnabled,
})
