import { useCallback } from 'react'
import { useFetchSpotPreview } from '@/api/facades/spot'
import { useDrawerStore } from '@/stores/useDrawerStore'
import type { FilterValues } from '@/stores/useFilterStore'
import { toPinListItems } from '@/lib/utils/spotPreview'
import { timingToStatus } from '@/lib/utils/timing'
import { track } from '@/lib/analytics'
import { STAGE_LABEL } from '@/constants/map'
import type { MapSpot } from '@/lib/utils/mapCluster'

// 지도 핀·클러스터를 눌렀을 때 프리뷰를 받아 핀 드로어를 연다.
export function useSpotPreviewDrawer(applied: Pick<FilterValues, 'categories' | 'timing'>) {
  const openPinDrawer = useDrawerStore((s) => s.openPinDrawer)
  const fetchSpotPreview = useFetchSpotPreview()

  // 핀 하나든 필터 결과 목록이든 같은 preview API 로 채운다.
  // 서버가 탐색·지도에 노출되는 명소의 Spot 행을 미리 만들어 주므로 spotId 가 사실상 항상 있고,
  // 예전처럼 클릭 시 POST /api/spots/match 로 만들어 낼 필요가 없다.
  const handlePinClick = useCallback(
    async (spot: MapSpot) => {
      try {
        if (spot.spotId != null) {
          track('map_pin_click', { spot_id: spot.spotId })
          const preview = await fetchSpotPreview([spot.spotId], {
            categories: applied.categories,
            status: timingToStatus(applied.timing),
          })
          const items = preview ? toPinListItems(preview.items) : []

          if (items.length > 0) {
            openPinDrawer(items)
            return
          }
        }
      } catch (e) {
        console.error(e)
      }

      // 프리뷰를 못 가져오면(좌표만 있는 핀·비공개·네트워크 실패) 지도 개화 데이터로 폴백한다.
      openPinDrawer(
        spot.flowers.map((f) => ({
          type: 'list' as const,
          title: f.alt || '명소',
          location: spot.title ?? '위치 정보 없음',
          description: `현재 ${STAGE_LABEL[spot.maxStage]} 상태입니다.`,
          badges: f.alt ? [{ label: f.alt, icon: f.src }] : [],
          isFavorite: false,
          images: [f.src],
          spotId: spot.spotId ?? spot.attractionId,
        }))
      )
    },
    [openPinDrawer, fetchSpotPreview, applied.categories, applied.timing]
  )

  // 확대해도 갈라지지 않는 클러스터. 구성원 전체를 한 목록으로 연다.
  const handleClusterClick = useCallback(
    async (members: MapSpot[]) => {
      const spotIds = members.map((s) => s.spotId).filter((id): id is number => id != null)

      try {
        const preview = await fetchSpotPreview(spotIds, {
          categories: applied.categories,
          status: timingToStatus(applied.timing),
        })
        const items = preview ? toPinListItems(preview.items) : []

        if (items.length > 0) {
          openPinDrawer(items)
          return
        }
      } catch (e) {
        console.error(e)
      }

      // 프리뷰가 비면 핀 하나를 탭했을 때와 같은 폴백을 쓴다.
      handlePinClick(members[0])
    },
    [fetchSpotPreview, applied.categories, applied.timing, openPinDrawer, handlePinClick]
  )

  return { handlePinClick, handleClusterClick }
}
