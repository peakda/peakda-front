'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapSkeleton } from '@/components/Map/MapSkeleton'
import { Header } from '@/components/ui/layout/Header'
import Image from 'next/image'
import { Nav } from '@/components/ui/layout/Nav'
import { LocationBtn } from '@/components/ui/button/LocationBtn'
import { SearchBar } from '@/components/ui/form/SearchBar'
import { Category } from '@/components/ui/category/Category'
import { toast } from 'sonner'
import { useMapCluster, type MapSpot } from '@/hooks/useMapPins'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { hasActiveFilter, useFilterStore, type PinTypeFilter } from '@/stores/useFilterStore'
import { filterMapSpots } from '@/lib/utils/mapFilter'
import { timingToStatus, timingToStatuses } from '@/lib/utils/timing'
import { useBloomMap } from '@/api/facades/seasonal-bloom'
import { useHomeSuggestion } from '@/api/facades/home'
import { useUnreadNotificationCount } from '@/api/facades/notification'
import { spotPreviewApi } from '@/api/facades/spot'
import { toPinListItems } from '@/lib/utils/spotPreview'
import { bloomToMapSpots } from '@/lib/utils/bloomToMapSpots'
import { REGION_MAP_CENTERS } from '@/constants/region'
import { STAGE_LABEL } from '@/constants/map'
import type { GetSeasonalBloomsParams } from '@/api/facades/generated/peakdaApi.schemas'
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

const INITIAL_LEVEL = 8

// bbox를 격자에 스냅해 미세 이동 시 동일 쿼리 키로 수렴시킨다(캐시 히트 + staleTime 작동).
// 소수점 2자리(≈ 1km) 격자. 뷰를 항상 덮도록 min은 내림, max는 올림.
const BBOX_GRID = 100
const snapDown = (v: number) => Math.floor(v * BBOX_GRID) / BBOX_GRID
const snapUp = (v: number) => Math.ceil(v * BBOX_GRID) / BBOX_GRID

// 지도 정착 후 실제 조회까지의 지연. 연속 이동 중엔 마지막 정착만 조회한다.
const BBOX_DEBOUNCE_MS = 1000

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
    },
    { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8_000 }
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
  const isRegionMovePendingRef = useRef(false)
  const searchParams = useSearchParams()
  const [isRegionMovePending, setIsRegionMovePending] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [areTilesLoaded, setAreTilesLoaded] = useState(false)
  const [bbox, setBbox] = useState<GetSeasonalBloomsParams | null>(null)
  const { isReady: isSdkReady, error, retry } = useLazyMapLoad()
  const openFilterDrawer = useDrawerStore((s) => s.openFilterDrawer)
  const openPinDrawer = useDrawerStore((s) => s.openPinDrawer)
  const pinType = useFilterStore((s) => s.pinType)
  const applied = useFilterStore((s) => s.applied)
  const draftCategories = useFilterStore((s) => s.draft.categories)
  const setPinType = useFilterStore((s) => s.setPinType)
  const setVisibleSpots = useFilterStore((s) => s.setVisibleSpots)

  const statuses = useMemo(() => timingToStatuses(applied.timing), [applied.timing])

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const initialCenter = useMemo(() => {
    const lat = toCoord(latParam)
    const lng = toCoord(lngParam)
    return lat != null && lng != null ? { lat, lng } : null
  }, [latParam, lngParam])

  // 서버로 나가는 건 bbox·개화상태(status)·권역(region)이다. 전부 applied 기준이라
  // 드로어에서 필터를 만지는 것만으로는 요청이 나가지 않는다.
  //
  // 꽃 종류(categories)는 일부러 보내지 않는다. 서버가 걸러 주면 ①드로어 하단의
  // 'N개의 명소 보기' 를 draft 기준으로 셀 수 없고 ②응답에서 안 고른 꽃이 빠져
  // 핀 아이콘을 선택에 맞게 좁힐 수 없다. 대신 응답의 category 로 클라에서 거른다.
  const bloomParams = useMemo(
    () =>
      bbox
        ? { ...bbox, status: timingToStatus(applied.timing), region: applied.region ?? undefined }
        : null,
    [bbox, applied.timing, applied.region]
  )
  const { data: bloomData, isPlaceholderData } = useBloomMap(bloomParams)
  const allSpots = useMemo(() => (bloomData ? bloomToMapSpots(bloomData) : []), [bloomData])

  const spots = useMemo(
    () =>
      filterMapSpots(allSpots, {
        pinType,
        statuses,
        categories: applied.categories,
      }),
    [allSpots, pinType, statuses, applied.categories]
  )

  // 꽃 종류는 클라 필터라 서버를 다녀오지 않고도 draft 기준 개수를 미리 셀 수 있다.
  // (지역·시기는 서버를 다녀와야 알 수 있어 버튼이 '명소 보기' 로 고정된다)
  const draftSpots = useMemo(
    () =>
      filterMapSpots(allSpots, {
        pinType,
        statuses,
        categories: draftCategories,
      }),
    [allSpots, pinType, statuses, draftCategories]
  )

  // 드로어의 'N개의 명소 보기' 버튼이 쓸 현재 화면의 필터 결과를 올려준다.
  // 프리뷰는 spotId 로만 조회하므로 아직 Spot 행이 없는 명소(spotId=null)는 제외한다.
  useEffect(() => {
    // bbox 는 캐시 히트를 위해 격자에 스냅돼 화면보다 넓다. 개수는 실제 화면 기준이어야 하므로
    // 여기서 현재 bounds 로 한 번 더 거른다.
    const bounds = mapInstance?.getBounds()
    const inView = (list: MapSpot[]) => {
      if (!bounds) return list
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      return list.filter(
        (s) =>
          s.lat >= sw.getLat() &&
          s.lat <= ne.getLat() &&
          s.lng >= sw.getLng() &&
          s.lng <= ne.getLng()
      )
    }

    const center = mapInstance?.getCenter()
    setVisibleSpots({
      spotIds: inView(spots)
        .map((s) => s.spotId)
        .filter((id): id is number => id != null),
      center: center ? { lat: center.getLat(), lng: center.getLng() } : null,
      // 아직 이전 조건의 결과를 보고 있으면 목록 열기를 기다려야 한다.
      isStale: isPlaceholderData || isRegionMovePending,
      draftCount: inView(draftSpots).filter((s) => s.spotId != null).length,
      // 어떤 조건으로 계산한 결과인지 함께 올린다. 드로어가 이걸로 최신 여부를 판단한다.
      appliedFor: applied,
    })
    // 드로어가 "이 결과가 어떤 applied 기준인지" 를 참조 비교로 판단하므로 applied 를 함께 넣는다.
  }, [
    spots,
    draftSpots,
    mapInstance,
    isPlaceholderData,
    isRegionMovePending,
    applied,
    setVisibleSpots,
  ])

  // 시즌 추천어(홈 검색바 보조 카피). 절정 데이터 없으면(available=false) 기본 문구로 폴백.
  const { data: suggestion } = useHomeSuggestion()
  const searchDescription =
    suggestion?.available && suggestion.message ? suggestion.message : '벚꽃 만개 지역'

  // 안 읽은 알림이 있을 때만 헤더 알림 버튼에 점 표시
  const { data: unread } = useUnreadNotificationCount()
  const hasUnreadNotification = (unread?.unreadCount ?? 0) > 0

  // 핀 하나든 필터 결과 목록이든 같은 preview API 로 채운다.
  // 서버가 탐색·지도에 노출되는 명소의 Spot 행을 미리 만들어 주므로 spotId 가 사실상 항상 있고,
  // 예전처럼 클릭 시 POST /api/spots/match 로 만들어 낼 필요가 없다.
  const handlePinClick = useCallback(
    async (spot: MapSpot) => {
      try {
        if (spot.spotId != null) {
          const center = mapInstance?.getCenter()
          const preview = await spotPreviewApi([spot.spotId], {
            coords: center ? { lat: center.getLat(), lng: center.getLng() } : null,
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
    [openPinDrawer, mapInstance, applied.categories, applied.timing]
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
      timer = setTimeout(() => {
        updateBbox()
        // 지역 이동 중에는 이전 bbox의 빈 응답이 먼저 도착할 수 있다. 새 bbox를 반영한 뒤에만
        // 드로어가 결과 목록을 열도록 대기 상태를 해제한다.
        if (isRegionMovePendingRef.current) {
          isRegionMovePendingRef.current = false
          setIsRegionMovePending(false)
        }
      }, BBOX_DEBOUNCE_MS)
    }

    updateBbox() // 첫 진입은 즉시 조회
    kakao.maps.event.addListener(mapInstance, 'idle', onIdle)
    return () => {
      clearTimeout(timer)
      kakao.maps.event.removeListener(mapInstance, 'idle', onIdle)
    }
  }, [mapInstance])

  // 권역은 현재 화면 bbox와 AND 조건으로 조회된다. 먼저 해당 권역의 중심으로 옮겨야
  // 이전 화면 영역 때문에 결과가 비는 일을 막고, idle 이벤트가 새 bbox로 재조회한다.
  useEffect(() => {
    if (!mapInstance) return
    if (!applied.region) {
      isRegionMovePendingRef.current = false
      setIsRegionMovePending(false)
      return
    }

    const center = REGION_MAP_CENTERS[applied.region]
    isRegionMovePendingRef.current = true
    setIsRegionMovePending(true)
    mapInstance.panTo(new kakao.maps.LatLng(center.lat, center.lng))
  }, [mapInstance, applied.region])

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
    if (!isSdkReady) return
    toast.dismiss(NETWORK_TOAST_ID)
  }, [isSdkReady])

  const handleLocate = useCallback(() => {
    if (!mapRef.current) return
    panToCurrentLocation(mapRef.current, () => {
      toast.error('위치 권한이 필요합니다.', {
        description: '브라우저 설정에서 위치 권한을 허용해주세요.',
      })
    })
  }, [])

  useEffect(() => {
    if (!isSdkReady || !containerRef.current) return

    let map = mapRef.current
    if (!map) {
      const center = initialCenter ?? DEFAULT_CENTER
      map = initMap(containerRef.current, center)
      mapRef.current = map
      setMapInstance(map)

      // 쿼리 좌표로 들어온 경우엔 현재 위치로 튕기지 않는다.
      if (!initialCenter) panToCurrentLocation(map)
    }

    // SDK 준비와 실제 지도 표시 완료는 다르다. 첫 타일이 모두 그려질 때까지
    // 로딩 레이어를 유지해 느린 네트워크에서 흰 지도 영역이 노출되지 않게 한다.
    let frameId: number | null = null
    const handleTilesLoaded = () => {
      kakao.maps.event.removeListener(map, 'tilesloaded', handleTilesLoaded)
      frameId = window.requestAnimationFrame(() => setAreTilesLoaded(true))
    }

    kakao.maps.event.addListener(map, 'tilesloaded', handleTilesLoaded)
    return () => {
      kakao.maps.event.removeListener(map, 'tilesloaded', handleTilesLoaded)
      if (frameId != null) window.cancelAnimationFrame(frameId)
    }
  }, [isSdkReady, initialCenter])

  return (
    <div className="relative h-dvh w-full contain-strict">
      <div ref={containerRef} id="kakao-map" className="absolute inset-0 z-0 bg-green-50" />

      {!areTilesLoaded && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <MapSkeleton />
        </div>
      )}

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
            <Image src={'/icons/alram.svg'} alt="알람" width={20} height={20} className="h-6 w-6" />
            {hasUnreadNotification && (
              <div className="absolute top-2.5 right-2.5 h-1 w-1 rounded-full bg-pink-500"></div>
            )}
          </div>
        }
      />

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
        hasActiveFilter={hasActiveFilter(applied)}
      />
      <MapLocationBtn onLocate={handleLocate} />
      <Nav activeTab="map" />
      {isSdkReady && <Drawer />}
    </div>
  )
}
