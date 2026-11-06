import { useEffect } from 'react'
import { Browser } from '@capacitor/browser'
import type { PromotionalMapPinResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { PROMOTIONAL_PIN_ICON } from '@/constants/map'
import { track } from '@/lib/analytics'
import { isNativeApp } from '@/lib/auth/nativeAuth'

// 아이콘 52px 중 꼬리 끝이 49.9px 지점이라 그 끝이 좌표를 가리키게 한다.
const PIN_Y_ANCHOR = 0.96
// 근처 명소 묶음에 가려지지 않게 위로 올린다(개화 핀은 zIndex 를 주지 않는다).
const PIN_Z_INDEX = 10

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

    const overlays = pins.flatMap((pin) => {
      const icon = PROMOTIONAL_PIN_ICON[pin.iconKey]
      if (!icon) return []

      const image = document.createElement('img')
      image.src = icon
      image.alt = ''
      image.className = 'block size-13 max-w-none'

      const content = document.createElement('div')
      content.className = 'cursor-pointer'
      content.setAttribute('role', 'button')
      content.setAttribute('aria-label', pin.name)
      content.tabIndex = 0
      content.append(image)

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
      return [overlay]
    })

    return () => overlays.forEach((overlay) => overlay.setMap(null))
  }, [map, pins])
}
