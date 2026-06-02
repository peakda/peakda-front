import type { MapSpot } from '@/hooks/useMapPins'

export const TEST_SPOTS: MapSpot[] = [
  {
    lat: 37.5662,
    lng: 126.9785,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }, { src: '/flowers/plum.svg', alt: '매화' }],
  },
  {
    lat: 37.5700,
    lng: 126.9820,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  },
  {
    lat: 37.5640,
    lng: 126.9750,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }, { src: '/flowers/royal-azalea.svg', alt: '진달래' }],
  },
  {
    lat: 35.1796,
    lng: 129.0756,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  },
  {
    lat: 35.1600,
    lng: 129.0600,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/plum.svg', alt: '매화' }],
  },
  {
    lat: 33.4996,
    lng: 126.5312,
    maxStage: 'Before',
    flowers: [{ src: '/flowers/canola.svg', alt: '유채꽃' }],
  },
  {
    lat: 37.8813,
    lng: 127.7298,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/royal-azalea.svg', alt: '진달래' }],
  },
]
