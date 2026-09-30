'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapSkeleton } from '@/components/Map/MapSkeleton'
import { MapHeader } from '@/components/Map/MapHeader'
import { MapLocationBtn } from '@/components/Map/MapLocationBtn'
import { Nav } from '@/components/ui/layout/Nav'
import { SearchBar } from '@/components/ui/form/SearchBar'
import { Category } from '@/components/ui/category/Category'
import { toast } from 'sonner'
import { useMapCluster } from '@/hooks/useMapPins'
import { useSpotPreviewDrawer } from '@/hooks/useSpotPreviewDrawer'
import type { MapSpot } from '@/lib/utils/mapCluster'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { hasActiveFilter, useFilterStore, type PinTypeFilter } from '@/stores/useFilterStore'
import { filterMapSpots } from '@/lib/utils/mapFilter'
import { timingToStatus, timingToStatuses } from '@/lib/utils/timing'
import { useBloomMap } from '@/api/facades/seasonal-bloom'
import { useHomeSuggestion } from '@/api/facades/home'
import { bloomToMapSpots } from '@/lib/utils/bloomToMapSpots'
import { readMapView, rememberMapView } from '@/lib/utils/mapViewHistory'
import { loadAppSettings } from '@/lib/utils/appSettings'
import {
  initMap,
  mapBox,
  panToCurrentLocation,
  sameBbox,
  snapBbox,
  type Viewport,
} from '@/lib/kakao/mapViewport'
import { REGION_MAP_CENTERS } from '@/constants/region'
import type { GetSeasonalBloomsParams } from '@/api/facades/generated/peakdaApi.schemas'
import { useSearchParams } from 'next/navigation'

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

// 지도 정착 후 실제 조회까지의 지연. idle 자체가 이동 종료 후에만 발화하므로
// 여기서는 '드래그 → 짧은 멈춤 → 드래그' 연타만 흡수하면 된다.
const BBOX_DEBOUNCE_MS = 300

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

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isRegionMovePendingRef = useRef(false)
  const searchParams = useSearchParams()
  const [isRegionMovePending, setIsRegionMovePending] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [areTilesLoaded, setAreTilesLoaded] = useState(false)
  const [bbox, setBbox] = useState<GetSeasonalBloomsParams | null>(null)
  const [viewport, setViewport] = useState<Viewport | null>(null)
  // idle 은 mapInstance 당 한 번만 등록한다. region 을 deps 에 넣으면 권역이 바뀔 때 effect 가
  // 다시 돌면서 '아직 이동 전 bounds + 새 region' 으로 조회해 버리므로 ref 로 읽는다.
  const appliedRegionRef = useRef<GetSeasonalBloomsParams['region']>(undefined)
  const { isReady: isSdkReady, error, retry } = useLazyMapLoad()
  const openFilterDrawer = useDrawerStore((s) => s.openFilterDrawer)
  const pinType = useFilterStore((s) => s.pinType)
  const applied = useFilterStore((s) => s.applied)
  const draftCategories = useFilterStore((s) => s.draft.categories)
  const setPinType = useFilterStore((s) => s.setPinType)
  const setVisibleSpots = useFilterStore((s) => s.setVisibleSpots)

  // 격자 스냅 덕에 셀 안에서의 이동은 같은 값으로 수렴한다. 값이 같으면 객체를 갈지 않아
  // 조회도 리렌더도 일어나지 않게 한다(새 객체로 setState 하면 값이 같아도 리렌더된다).
  const applyBbox = useCallback((next: GetSeasonalBloomsParams) => {
    setBbox((prev) => (prev && sameBbox(prev, next) ? prev : next))
  }, [])

  const statuses = useMemo(() => timingToStatuses(applied.timing), [applied.timing])

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const initialCenter = useMemo(() => {
    const lat = toCoord(latParam)
    const lng = toCoord(lngParam)
    return lat != null && lng != null ? { lat, lng } : null
  }, [latParam, lngParam])
  // 좌표가 없는 축제·큐레이션은 주소·장소명(?q)으로 넘어온다. 괄호 속 부연(예: '(효석문화제)')은
  // 키워드 검색을 실패하게 만들어 떼고 찾는다.
  const targetQuery = searchParams.get('q')?.replace(/\(.*?\)/g, '').trim() || null
  const targetSpotId = toCoord(searchParams.get('spotId'))

  // ?spotId 로 들어오면 그 명소 핀을 찾아 드로어를 연다. 좌표가 정해진 뒤에만 채운다.
  const pendingTargetRef = useRef<{ spotId: number; lat: number; lng: number } | null>(null)

  // 서버로 나가는 건 bbox·개화상태(status)·권역(region)이다. 전부 applied 기준이라
  // 드로어에서 필터를 만지는 것만으로는 요청이 나가지 않는다.
  //
  // 꽃 종류(categories)는 일부러 보내지 않는다. 서버가 걸러 주면 ①드로어 하단의
  // 'N개의 명소 보기' 를 draft 기준으로 셀 수 없고 ②응답에서 안 고른 꽃이 빠져
  // 핀 아이콘을 선택에 맞게 좁힐 수 없다. 대신 응답의 category 로 클라에서 거른다.
  // region 은 bbox 와 원자적으로 바뀌어야 해서 bbox state 안에 들어 있다(snapBbox 주석 참고).
  const bloomParams = useMemo(
    () => (bbox ? { ...bbox, status: timingToStatus(applied.timing) } : null),
    [bbox, applied.timing]
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
    // idle 마다 갱신되는 viewport 로 한 번 더 거른다. (지도에서 직접 getBounds 를 읽으면
    // 그 값이 deps 에 안 잡혀, 재조회 없이 끝나는 팬에서 개수가 옛 화면 기준으로 남는다)
    const inView = (list: MapSpot[]) => {
      if (!viewport) return list
      return list.filter(
        (s) =>
          s.lat >= viewport.minLat &&
          s.lat <= viewport.maxLat &&
          s.lng >= viewport.minLng &&
          s.lng <= viewport.maxLng
      )
    }

    const center = viewport
      ? {
          lat: (viewport.minLat + viewport.maxLat) / 2,
          lng: (viewport.minLng + viewport.maxLng) / 2,
        }
      : null
    setVisibleSpots({
      spotIds: inView(spots)
        .map((s) => s.spotId)
        .filter((id): id is number => id != null),
      center,
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
    viewport,
    isPlaceholderData,
    isRegionMovePending,
    applied,
    setVisibleSpots,
  ])

  // 시즌 추천어(홈 검색바 보조 카피). 절정 데이터 없으면(available=false) 기본 문구로 폴백.
  const { data: suggestion } = useHomeSuggestion()
  const searchDescription =
    suggestion?.available && suggestion.message ? suggestion.message : '벚꽃 만개 지역'

  const { handlePinClick, handleClusterClick } = useSpotPreviewDrawer(applied)

  useMapCluster(mapInstance, spots, handlePinClick, handleClusterClick)

  // 목표 좌표를 담은 영역의 조회 결과가 도착했을 때 한 번만 찾는다. 이전 영역의 결과
  // (placeholder)나 목표가 빠진 bbox 의 결과로 판정하면 핀이 있는데도 못 찾고 끝난다.
  // 필터로 가려진 핀이어도 사용자가 고른 명소라 allSpots 에서 찾는다. 없으면 이동만 한다.
  useEffect(() => {
    const target = pendingTargetRef.current
    if (!target || !bbox || !bloomData || isPlaceholderData) return
    const inBbox =
      target.lat >= bbox.minLat &&
      target.lat <= bbox.maxLat &&
      target.lng >= bbox.minLng &&
      target.lng <= bbox.maxLng
    if (!inBbox) return

    pendingTargetRef.current = null
    const spot = allSpots.find((s) => s.spotId === target.spotId)
    if (spot) handlePinClick(spot)
  }, [bbox, bloomData, isPlaceholderData, allSpots, handlePinClick])

  // 지도 이동/줌이 멈출 때(idle) 현재 영역(bbox)으로 개화현황을 조회한다.
  // 좌표를 격자에 스냅해 캐시가 작동하게 하고, 연속 이동은 debounce로 마지막 정착만 조회한다.
  useEffect(() => {
    if (!mapInstance) return

    // 화면 안 개수는 이미 받아 둔 데이터로 세므로 조회와 달리 지연시키지 않는다.
    const syncViewport = () => setViewport(mapBox(mapInstance))

    // 상세로 나갔다 뒤로 돌아왔을 때 보던 자리로 되살리기 위해, 정착할 때마다 남겨 둔다.
    const saveView = () => {
      const center = mapInstance.getCenter()
      rememberMapView({
        lat: center.getLat(),
        lng: center.getLng(),
        level: mapInstance.getLevel(),
      })
    }

    const updateBbox = () =>
      applyBbox(snapBbox(mapBox(mapInstance), mapInstance.getLevel(), appliedRegionRef.current))

    let timer: ReturnType<typeof setTimeout>
    const onIdle = () => {
      syncViewport()
      saveView()
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

    syncViewport()
    saveView() // idle 전에 핀을 눌러 나가도 위치가 남아 있도록 한 번 기록
    updateBbox() // 첫 진입은 즉시 조회
    kakao.maps.event.addListener(mapInstance, 'idle', onIdle)
    return () => {
      clearTimeout(timer)
      kakao.maps.event.removeListener(mapInstance, 'idle', onIdle)
    }
  }, [mapInstance, applyBbox])

  // 권역은 현재 화면 bbox와 AND 조건으로 조회된다. 이동이 끝나길 기다리면 옛 화면 영역
  // 때문에 결과가 비므로, panTo 가 줌을 바꾸지 않는다는 점을 이용해 '새 중심 ± 지금의 반폭'
  // 으로 bbox·region 을 먼저 확정한다. 이동 후 idle 이 계산하는 값과 같아(sameBbox) 두 번째
  // 요청은 나가지 않는다 — 권역 전환에 조회 1건만 쓴다.
  useEffect(() => {
    if (!mapInstance) return

    const region = applied.region ?? undefined
    appliedRegionRef.current = region
    const level = mapInstance.getLevel()

    if (!applied.region) {
      isRegionMovePendingRef.current = false
      setIsRegionMovePending(false)
      // 권역을 풀 때는 지도를 옮기지 않고 파라미터만 뗀다.
      applyBbox(snapBbox(mapBox(mapInstance), level, region))
      return
    }

    const center = REGION_MAP_CENTERS[applied.region]
    const box = mapBox(mapInstance)
    const halfLat = (box.maxLat - box.minLat) / 2
    const halfLng = (box.maxLng - box.minLng) / 2

    applyBbox(
      snapBbox(
        {
          minLat: center.lat - halfLat,
          minLng: center.lng - halfLng,
          maxLat: center.lat + halfLat,
          maxLng: center.lng + halfLng,
        },
        level,
        region
      )
    )

    isRegionMovePendingRef.current = true
    setIsRegionMovePending(true)
    mapInstance.panTo(new kakao.maps.LatLng(center.lat, center.lng))
  }, [mapInstance, applied.region, applyBbox])

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
    if (!loadAppSettings().locationEnabled) {
      toast.error('설정에서 위치 정보 사용을 켜주세요.')
      return
    }
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
      // 이 히스토리 엔트리에 값이 있다는 건 여기서 지도를 보다가 상세로 갔다 돌아왔다는 뜻이라
      // 쿼리 좌표보다 우선한다. ?lat/?lng 는 그 화면에 '처음' 들어올 때만 의미가 있다.
      const savedView = readMapView()
      const center = savedView ?? initialCenter ?? DEFAULT_CENTER
      const createdMap = initMap(containerRef.current, center, savedView?.level ?? INITIAL_LEVEL)
      map = createdMap
      mapRef.current = map

      // 핀 자동 선택도 처음 들어올 때만 한다. 뒤로가기로 돌아왔는데 드로어가 또 열리면 안 된다.
      if (!savedView && initialCenter && targetSpotId != null) {
        pendingTargetRef.current = { spotId: targetSpotId, ...initialCenter }
      }
      setMapInstance(map)

      const canUseLocation = loadAppSettings().locationEnabled
      // 보던 위치로 되살렸거나 쿼리 좌표로 들어온 경우엔 현재 위치로 튕기지 않는다.
      if (!savedView && !initialCenter && targetQuery) {
        // 검색에 실패하면(결과 없음) 쿼리 없이 들어온 것처럼 현재 위치로 보낸다.
        new kakao.maps.services.Places().keywordSearch(targetQuery, (data, status) => {
          const place = status === kakao.maps.services.Status.OK ? data[0] : undefined
          if (!place) {
            if (canUseLocation) panToCurrentLocation(createdMap)
            return
          }
          const lat = Number(place.y)
          const lng = Number(place.x)
          if (targetSpotId != null) pendingTargetRef.current = { spotId: targetSpotId, lat, lng }
          createdMap.setCenter(new kakao.maps.LatLng(lat, lng))
        })
      } else if (!savedView && !initialCenter && canUseLocation) {
        panToCurrentLocation(map)
      }
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
  }, [isSdkReady, initialCenter, targetQuery, targetSpotId])

  return (
    <div className="relative h-dvh w-full contain-strict">
      <div ref={containerRef} id="kakao-map" className="absolute inset-0 z-0 bg-green-50" />

      {!areTilesLoaded && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <MapSkeleton />
        </div>
      )}

      <MapHeader />

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
