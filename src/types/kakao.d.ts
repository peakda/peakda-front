declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    panTo(latlng: LatLng): void
    getCenter(): LatLng
    setLevel(level: number, options?: { anchor?: LatLng; animate?: boolean }): void
    getLevel(): number
    getBounds(): LatLngBounds
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class LatLngBounds {
    getSouthWest(): LatLng
    getNorthEast(): LatLng
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LatLng
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions)
    setMap(map: Map | null): void
    setPosition(latlng: LatLng): void
    getPosition(): LatLng
    setContent(content: string | HTMLElement): void
    setVisible(visible: boolean): void
    setZIndex(zIndex: number): void
  }

  function load(callback: () => void): void

  namespace services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    interface PlacesSearchResultItem {
      id: string
      place_name: string
      address_name: string
      road_address_name: string
      category_name: string
      /** 경도 (longitude) */
      x: string
      /** 위도 (latitude) */
      y: string
    }

    class Places {
      constructor()
      keywordSearch(
        keyword: string,
        callback: (data: PlacesSearchResultItem[], status: Status) => void
      ): void
    }
  }

  namespace event {
    function addListener(target: object, type: string, handler: () => void): void
    function removeListener(target: object, type: string, handler: () => void): void
  }

  enum MapTypeId {
    ROADMAP = 1,
    SKYVIEW = 2,
    HYBRID = 3,
  }

  interface MapOptions {
    center: LatLng
    level?: number
    mapTypeId?: MapTypeId
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClickZoom?: boolean
    maxLevel?: number
  }

  interface MarkerOptions {
    map?: Map
    position: LatLng
  }

  interface CustomOverlayOptions {
    position: LatLng
    content: string | HTMLElement
    map?: Map
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
    clickable?: boolean
  }
}

interface Window {
  kakao: typeof kakao & {
    maps: typeof kakao.maps & {
      load: (callback: () => void) => void
    }
  }
}
