// 스팟 상세 API가 아직 없어 목업 데이터로 UI를 구현한다. (feed/saved 페이지와 동일한 패턴)

export interface FestivalInfo {
  hours: string
  fee: string
  period: string
}

export interface SpotDetail {
  id: number
  type: 'general' | 'festival'
  name: string
  location: string
  status: string
  statusVariant: 'green' | 'bloom' | 'secondary' | 'dark'
  flowers: { emoji: string; label: string }[]
  bloomPeriod: string
  guide: string[]
  festival?: FestivalInfo
}

export interface SpotFeed {
  authorName: string
  location: string
  timeAgo: string
  visitDate: string
  statusLabel: string
  statusVariant: 'dark' | 'bloom' | 'secondary' | 'green'
  images: string[]
  flowers: { emoji: string; label: string }[]
  content: string
  reactions: { emoji: string; count: number }[]
  isOwner?: boolean
}

const MOCK_SPOTS: Record<string, SpotDetail> = {
  // 일반 스팟
  '1': {
    id: 1,
    type: 'general',
    name: '진해 경화역 공원',
    location: '경상남도 창원시 진해구 진해대로',
    status: '이르다',
    statusVariant: 'green',
    flowers: [{ emoji: '🌸', label: '벚꽃' }],
    bloomPeriod: '3.28(토) ~ 4.5(일)',
    guide: [
      '오전 일찍 방문하면 사람이 적어 사진 찍기 좋아요.',
      '경화역 근처 무료 주차장을 이용할 수 있어요.',
      '철길을 따라 벚꽃 터널이 이어져요.',
    ],
  },
  // 축제/행사 스팟
  '2': {
    id: 2,
    type: 'festival',
    name: '진해 군항제',
    location: '경상남도 창원시 진해구 일원',
    status: '절정',
    statusVariant: 'bloom',
    flowers: [{ emoji: '🌸', label: '벚꽃' }],
    bloomPeriod: '3.28(토) ~ 4.5(일)',
    guide: [
      '축제 기간에는 대중교통 이용을 권장해요.',
      '야간 경관 조명이 켜지는 저녁 시간대가 인기예요.',
    ],
    festival: {
      hours: '09:00 ~ 21:00',
      fee: '무료',
      period: '상시 운영 · 3.28(토) ~ 4.5(일)',
    },
  },
}

export function getMockSpot(id: string): SpotDetail {
  return MOCK_SPOTS[id] ?? MOCK_SPOTS['1']
}

export const MOCK_SPOT_FEEDS: SpotFeed[] = [
  {
    authorName: 'Nickname',
    location: '진해 경화역 공원',
    timeAgo: '2시간전',
    visitDate: '2026.05.28',
    statusLabel: '이르다',
    statusVariant: 'green',
    images: ['/images/explore.png', '/images/explore.png'],
    flowers: [{ emoji: '🌸', label: '벚꽃' }],
    content: '아직 개화가 시작되지 않았지만, 산책로가 정말 예뻐요!',
    reactions: [
      { emoji: '❤️', count: 999 },
      { emoji: '😀', count: 999 },
    ],
  },
  {
    authorName: 'FlowerLover',
    location: '진해 경화역 공원',
    timeAgo: '5시간전',
    visitDate: '2026.05.27',
    statusLabel: '절정',
    statusVariant: 'bloom',
    images: ['/images/explore.png'],
    flowers: [{ emoji: '🌸', label: '벚꽃' }],
    content: '벚꽃이 정말 절정이에요! 지금 바로 가세요.',
    reactions: [
      { emoji: '❤️', count: 234 },
      { emoji: '😀', count: 56 },
    ],
    isOwner: true,
  },
]
