import { useEffect } from 'react'
import { Browser } from '@capacitor/browser'
import type { PromotionalMapPinResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { PROMOTIONAL_PIN_ICON } from '@/constants/map'
import { track } from '@/lib/analytics'
import { isNativeApp } from '@/lib/auth/nativeAuth'

// 아이콘 높이의 96% 지점이 꼬리 끝이라 그 끝이 좌표를 가리키게 한다.
const PIN_Y_ANCHOR = 0.96
// 근처 명소 묶음에 가려지지 않게 위로 올린다(개화 핀은 zIndex 를 주지 않는다).
const PIN_Z_INDEX = 10
// 클러스터가 생기는 레벨(mapCluster.ts 의 level < 4 분기)부터 클러스터와 같은 크기로 키운다.
const LARGE_PIN_MIN_LEVEL = 4

// 레이아웃은 개별 핀 크기(60px, 원 지름 40px)로 두고 큰 핀은 꼬리 끝을 기준으로 확대한다(84px, 원 지름 56px).
// 레이아웃 크기가 그대로라 카카오의 앵커 계산과 무관하게 꼬리가 좌표에 남는다.
const LARGE_PIN_CLASS = 'scale-140'

// 아이콘의 투명 여백은 탭을 지도와 아래 핀으로 흘려보내고, 보이는 원과 꼬리만 누를 수 있게 한다.
const HIT_AREA_CLASSES = [
  'absolute top-[16.92%] left-[16.92%] size-[66.16%] rounded-full',
  'absolute top-[82.7%] left-[40.5%] h-[13.5%] w-[19%]',
]

// 앱은 WebView 의 새 창 처리에 기대지 않고 Custom Tab(소셜 로그인과 같은 플러그인)으로 연다.
function openPinLink(url: string) {
  if (isNativeApp()) {
    Browser.open({ url }).catch((error: unknown) => console.error(error))
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 홍보 핀은 개화 핀(useMapCluster)과 따로 그린다. 묶이지 않고, 필터와 'N개의 명소 보기' 개수에도 들어가지 않는다.
export function usePromotionalPins(
  map: kakao.maps.Map | null,
  pins: PromotionalMapPinResponse[] | undefined
) {
  useEffect(() => {
    if (!map || !pins) return

    const views = pins.flatMap((pin) => {
      const icon = PROMOTIONAL_PIN_ICON[pin.iconKey]
      if (!icon) return []

      // 레벨이 바뀌는 순간 이미지가 비어 보이지 않게 두 크기를 미리 받아 둔다.
      new Image().src = icon.small
      new Image().src = icon.large

      const image = document.createElement('img')
      image.alt = ''
      image.className = 'block size-full max-w-none'

      const content = document.createElement('div')
      content.className = 'pointer-events-none relative size-15 origin-[50%_96%]'
      content.setAttribute('role', 'button')
      content.setAttribute('aria-label', pin.name)
      content.tabIndex = 0
      content.append(image)
      HIT_AREA_CLASSES.forEach((className) => {
        const hitArea = document.createElement('span')
        hitArea.className = `pointer-events-auto cursor-pointer ${className}`
        content.append(hitArea)
      })

      const activate = () => {
        track('map_promo_pin_click', { pin_id: pin.id })
        openPinLink(pin.linkUrl)
      }
      content.addEventListener('click', activate)
      content.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault() // Space 가 페이지를 스크롤하지 않게
        activate()
      })

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(pin.latitude, pin.longitude),
        content,
        xAnchor: 0.5,
        yAnchor: PIN_Y_ANCHOR,
        zIndex: PIN_Z_INDEX,
      })
      overlay.setMap(map)
      return [{ overlay, content, image, icon }]
    })

    // 핀치줌 중 zoom_changed 가 연달아 오므로 크기 구간이 바뀔 때만 손댄다.
    let isLarge: boolean | null = null
    const applyPinSize = () => {
      const next = map.getLevel() >= LARGE_PIN_MIN_LEVEL
      if (next === isLarge) return
      isLarge = next
      views.forEach(({ content, image, icon }) => {
        content.classList.toggle(LARGE_PIN_CLASS, next)
        image.src = next ? icon.large : icon.small
      })
    }
    applyPinSize()
    kakao.maps.event.addListener(map, 'zoom_changed', applyPinSize)

    return () => {
      kakao.maps.event.removeListener(map, 'zoom_changed', applyPinSize)
      views.forEach(({ overlay }) => overlay.setMap(null))
    }
  }, [map, pins])
}
