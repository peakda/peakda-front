'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MainMessage } from '@/components/ui/message/MainMessage'
import { Header } from '@/components/ui/layout/Header'
import Image from 'next/image'
import { prefetchInitialTiles } from '@/lib/kakao/tilePrefetch'
import { Nav } from '@/components/ui/layout/Nav'
import { LocationBtn } from '@/components/ui/button/LocationBtn'
import { SearchBar } from '@/components/ui/form/SearchBar'
import { Category } from '@/components/ui/category/Category'
import { toast } from 'sonner'
import { useMapCluster, type MapSpot } from '@/hooks/useMapPins'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useFilterStore, type PinTypeFilter } from '@/stores/useFilterStore'
import { filterMapSpots } from '@/lib/utils/mapFilter'
import { useBloomMap } from '@/api/facades/seasonal-bloom'
import { useHomeSuggestion } from '@/api/facades/home'
import { useUnreadNotificationCount } from '@/api/facades/notification'
import { matchSpotApi, useSpotDetailFetcher } from '@/api/facades/spot'
import { bloomToMapSpots } from '@/lib/utils/bloomToMapSpots'
import { STAGE_LABEL } from '@/constants/map'
import type {
  BloomBadgeStatus,
  GetSeasonalBloomsParams,
} from '@/api/facades/generated/peakdaApi.schemas'
import { useRouter, useSearchParams } from 'next/navigation'

const Drawer = dynamic(
  () => import('@/components/ui/layout/Drawer').then((m) => ({ default: m.Drawer })),
  { ssr: false }
)

const DEFAULT_CENTER = {
  lat: 37.5662,
  lng: 126.9785,
}

const NETWORK_TOAST_ID = 'map-network-error'

// initMap 의 level 과 prefetchInitialTiles 에 넘기는 level 은 반드시 같아야 한다.
// tilePrefetch 가 zoom = 14 - level 로 타일을 고르므로, 다르면 지도가 쓰지도 않을
// 줌의 타일을 받아와 프리페치가 통째로 버려진다.
const INITIAL_LEVEL = 8

// bbox를 격자에 스냅해 미세 이동 시 동일 쿼리 키로 수렴시킨다(캐시 히트 + staleTime 작동).
// 소수점 2자리(≈ 1km) 격자. 뷰를 항상 덮도록 min은 내림, max는 올림.
const BBOX_GRID = 100
const snapDown = (v: number) => Math.floor(v * BBOX_GRID) / BBOX_GRID
const snapUp = (v: number) => Math.ceil(v * BBOX_GRID) / BBOX_GRID

// 지도 정착 후 실제 조회까지의 지연. 연속 이동 중엔 마지막 정착만 조회한다.
const BBOX_DEBOUNCE_MS = 1000

const BADGE_STATUS_LABEL: Record<BloomBadgeStatus, string> = {
  PREPARING: '개화 전',
  STARTED: '개화 시작',
  PEAK: '만개',
  ENDED: '개화 종료',
}

// 상단 칩. 서버 파라미터가 없어 응답의 pin.type 으로 클라이언트에서 거른다.
const PIN_TYPES: PinTypeFilter[] = ['ALL', 'ATTRACTION', 'LOCAL']
const PIN_TYPE_LABEL: Record<PinTypeFilter, string> = {
  ALL: '전체',
  ATTRACTION: '명소',
  LOCAL: '동네',
}
const PIN_TYPE_LABELS = PIN_TYPES.map((type) => PIN_TYPE_LABEL[type])

// 축제 상세 등에서 /map?lat=..&lng=.. 로 넘어오면 그 좌표를 초기 중심으로 쓴다.
function toCoord(value: string | null) {
  if (value == null || value.trim() === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

// snapHeight 는 드로어를 스냅할 때마다 바뀐다. MapContainer 가 직접 구독하면
// 그때마다 지도 UI 전체(헤더·칩·검색바·Nav·드로어)가 다시 렌더되므로 이 버튼만 구독한다.
function MapLocationBtn({ onLocate }: { onLocate: () => void }) {
  const snapHeight = useDrawerStore((s) => s.snapHeight)

  return (
    <LocationBtn
      onLocate={onLocate}
      style={{
        bottom: snapHeight > 0 ? `${snapHeight + 16}px` : '96px',
        transition: 'bottom 0.5s cubic-bezier(0.32,0.72,0,1)',
      }}
    />
  )
}

function panToCurrentLocation(map: kakao.maps.Map, onPermissionDenied?: () => void) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => map.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude)),
    (err) => {
      if (err.code === err.PERMISSION_DENIED) onPermissionDenied?.()
    }
  )
}

const initMap = (container: HTMLElement, center: { lat: number; lng: number }) => {
  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(center.lat, center.lng),
    level: INITIAL_LEVEL,
    maxLevel: 13,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
  })

  return map
}

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [bbox, setBbox] = useState<GetSeasonalBloomsParams | null>(null)
  const { isReady, error, retry } = useLazyMapLoad(containerRef)
  const openFilterDrawer = useDrawerStore((s) => s.openFilterDrawer)
  const openPinDrawer = useDrawerStore((s) => s.openPinDrawer)
  const pinType = useFilterStore((s) => s.pinType)
  const category = useFilterStore((s) => s.category)
  const statuses = useFilterStore((s) => s.statuses)
  const setPinType = useFilterStore((s) => s.setPinType)

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const initialCenter = useMemo(() => {
    const lat = toCoord(latParam)
    const lng = toCoord(lngParam)
    return lat != null && lng != null ? { lat, lng } : null
  }, [latParam, lngParam])

  // 꽃 종류만 서버 파라미터(category)로 거르고, 핀 유형·개화 상태는 응답을 받아 클라에서 거른다.
  const bloomParams = useMemo(
    () => (bbox ? { ...bbox, category: category ?? undefined } : null),
    [bbox, category]
  )
  const { data: bloomData } = useBloomMap(bloomParams)
  const allSpots = useMemo(() => (bloomData ? bloomToMapSpots(bloomData) : []), [bloomData])
  const spots = useMemo(
    () => filterMapSpots(allSpots, { pinType, statuses }),
    [allSpots, pinType, statuses]
  )

  // 시즌 추천어(홈 검색바 보조 카피). 절정 데이터 없으면(available=false) 기본 문구로 폴백.
  const { data: suggestion } = useHomeSuggestion()
  const searchDescription =
    suggestion?.available && suggestion.message ? suggestion.message : '벚꽃 만개 지역'

  // 안 읽은 알림이 있을 때만 헤더 알림 버튼에 점 표시
  const { data: unread } = useUnreadNotificationCount()
  const hasUnreadNotification = (unread?.unreadCount ?? 0) > 0

  // 명소형 핀은 Spot 행이 아직 없어 spotId 가 없을 수 있다. 이때만 match 로 materialize 하고,
  // POST(생성 부작용)라 좌표 기준으로 캐시해 같은 핀을 다시 눌러도 재호출하지 않는다.
  const matchedSpotIdRef = useRef(new Map<string, number>())

  const resolveSpotId = useCallback(async (spot: MapSpot) => {
    if (spot.spotId != null) return spot.spotId

    const cacheKey = `${spot.lat},${spot.lng}`
    const cached = matchedSpotIdRef.current.get(cacheKey)
    if (cached != null) return cached

    const matched = await matchSpotApi({
      latitude: spot.lat,
      longitude: spot.lng,
      name: spot.title ?? '이름 없는 명소',
    })
    const matchedId = matched?.spot?.id
    if (matchedId != null) matchedSpotIdRef.current.set(cacheKey, matchedId)
    return matchedId
  }, [])

  const fetchSpotDetail = useSpotDetailFetcher()

  const handlePinClick = useCallback(
    async (spot: MapSpot) => {
      try {
        const spotId = await resolveSpotId(spot)
        const detail = spotId != null ? await fetchSpotDetail(spotId) : null

        if (detail) {
          // 유저가 올린 사진(방문 기록 대표 사진, 최신순 최대 3건)을 리스트로 노출한다.
          // 기록이 없으면 스팟 대표 이미지, 그것도 없으면 꽃 아이콘으로 내려간다.
          const recordPhotos = detail.recordPreview
            .map((record) => record.coverPhoto?.url)
            .filter((url): url is string => !!url)
          const images =
            recordPhotos.length > 0
              ? recordPhotos
              : detail.representativeImageUrl
                ? [detail.representativeImageUrl]
                : spot.flowers.map((f) => f.src)

          openPinDrawer([
            {
              type: 'list' as const,
              title: detail.name,
              location: detail.address ?? spot.title ?? '위치 정보 없음',
              description: detail.bloom
                ? `현재 ${BADGE_STATUS_LABEL[detail.bloom.status]} 상태입니다.`
                : '',
              Badges: detail.bloom ? [detail.bloom.displayName] : [],
              isFavorite: detail.favorite.favorited,
              images,
              spotId: detail.id,
            },
          ])
          return
        }
      } catch (e) {
        console.error(e)
      }

      // 상세를 못 가져오면(비로그인·매칭 실패 등) 기존 개화 데이터로 폴백한다.
      openPinDrawer(
        spot.flowers.map((f) => ({
          type: 'list' as const,
          title: f.alt || '명소',
          location: spot.title ?? '위치 정보 없음',
          description: `현재 ${STAGE_LABEL[spot.maxStage]} 상태입니다.`,
          Badges: f.alt ? [f.alt] : [],
          isFavorite: false,
          images: [f.src],
          spotId: spot.spotId ?? spot.attractionId,
        }))
      )
    },
    [openPinDrawer, resolveSpotId, fetchSpotDetail]
  )

  useMapCluster(mapInstance, spots, handlePinClick)

  // 지도 이동/줌이 멈출 때(idle) 현재 영역(bbox)으로 개화현황을 조회한다.
  // 좌표를 격자에 스냅해 캐시가 작동하게 하고, 연속 이동은 debounce로 마지막 정착만 조회한다.
  useEffect(() => {
    if (!mapInstance) return

    const updateBbox = () => {
      const bounds = mapInstance.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const next = {
        minLat: snapDown(sw.getLat()),
        minLng: snapDown(sw.getLng()),
        maxLat: snapUp(ne.getLat()),
        maxLng: snapUp(ne.getLng()),
      }
      // 격자 스냅 덕에 미세 이동은 같은 값으로 수렴한다. 값이 같으면 객체를 갈지 않아
      // 조회도 리렌더도 일어나지 않게 한다(새 객체로 setState 하면 값이 같아도 리렌더된다).
      setBbox((prev) =>
        prev &&
        prev.minLat === next.minLat &&
        prev.minLng === next.minLng &&
        prev.maxLat === next.maxLat &&
        prev.maxLng === next.maxLng
          ? prev
          : next
      )
    }

    let timer: ReturnType<typeof setTimeout>
    const onIdle = () => {
      clearTimeout(timer)
      timer = setTimeout(updateBbox, BBOX_DEBOUNCE_MS)
    }

    updateBbox() // 첫 진입은 즉시 조회
    kakao.maps.event.addListener(mapInstance, 'idle', onIdle)
    return () => {
      clearTimeout(timer)
      kakao.maps.event.removeListener(mapInstance, 'idle', onIdle)
    }
  }, [mapInstance])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/map-tile-sw.js').catch(console.error)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    toast.error('지도를 불러오지 못했습니다.', {
      id: NETWORK_TOAST_ID,
      description: '네트워크 연결을 확인해주세요.',
      action: {
        label: '재시도',
        onClick: retry,
      },
      duration: Infinity,
    })
  }, [error, retry])

  useEffect(() => {
    if (!isReady) return
    toast.dismiss(NETWORK_TOAST_ID)
  }, [isReady])

  const handleLocate = useCallback(() => {
    if (!mapRef.current) return
    panToCurrentLocation(mapRef.current, () => {
      toast.error('위치 권한이 필요합니다.', {
        description: '브라우저 설정에서 위치 권한을 허용해주세요.',
      })
    })
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current || mapRef.current) return

    const center = initialCenter ?? DEFAULT_CENTER
    prefetchInitialTiles(center, INITIAL_LEVEL)
    mapRef.current = initMap(containerRef.current, center)
    setMapInstance(mapRef.current)
    // 쿼리 좌표로 들어온 경우엔 현재 위치로 튕기지 않는다.
    if (!initialCenter) panToCurrentLocation(mapRef.current)
  }, [isReady, initialCenter])

  return (
    <div
      ref={containerRef}
      id="kakao-map"
      className="relative py-11"
      style={{ width: '100%', height: '100dvh', contain: 'strict' }}
    >
      {isReady && (
        <Header
          className="mt-2"
          left={
            <div className="flex items-center justify-center gap-2">
              <Image
                src={'/images/logo.png'}
                alt="로고"
                width={36}
                height={32}
                className="h-8 w-8.5"
              />
              <p className="font-advent text-center text-[30px] font-semibold! tracking-tight text-green-700">
                Peakda
              </p>
            </div>
          }
          right={
            <div
              className="bg-bg-primary-80 border-border-primary relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full p-1"
              onClick={() => router.push('/notification')}
            >
              <Image
                src={'/icons/alram.svg'}
                alt="알람"
                width={20}
                height={20}
                className="h-6 w-6"
              />
              {hasUnreadNotification && (
                <div className="absolute top-2.5 right-2.5 h-1 w-1 rounded-full bg-pink-500"></div>
              )}
            </div>
          }
        />
      )}

      {!isReady && (
        <div className="flex min-h-screen flex-col items-center justify-center py-11">
          <MainMessage />
        </div>
      )}

      {isReady && (
        <>
          <Category
            isMap
            categories={PIN_TYPE_LABELS}
            value={PIN_TYPE_LABEL[pinType]}
            onChange={(label) => {
              const next = PIN_TYPES.find((type) => PIN_TYPE_LABEL[type] === label)
              if (next) setPinType(next)
            }}
          />

          <SearchBar
            placeholder="지금 피크인 곳을 검색해보세요."
            description={searchDescription}
            onFilterClick={openFilterDrawer}
          />
          <MapLocationBtn onLocate={handleLocate} />
          <Nav activeTab="map" />
          <Drawer />
        </>
      )}
    </div>
  )
}
