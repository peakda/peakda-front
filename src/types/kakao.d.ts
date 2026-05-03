declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    getCenter(): LatLng
    setLevel(level: number): void
    getLevel(): number
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LatLng
  }

  function load(callback: () => void): void

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
  }

  interface MarkerOptions {
    map?: Map
    position: LatLng
  }
}

interface Window {
  kakao: typeof kakao & {
    maps: typeof kakao.maps & {
      load: (callback: () => void) => void
    }
  }
}