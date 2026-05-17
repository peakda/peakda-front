import { StepProps } from '@/types/types'

export const STEPS: StepProps[] = [
  {
    title: '지금 가면 가장 예쁜 곳 ',
    description: '만개 3일을 놓치지 않도록\n 지금 딱 좋은 계절 명소를 알려드릴게요',
    image: '/images/map.png',
  },
  {
    title: '놓치지 않게 알려드려요',
    description: '가고 싶은 곳을 정해두면\n만개 7일 전에 먼저 알림을 보내드려요',
    image: '/images/bell.png',
    Card: [
      {
        title: '찜한 여의도 한강공원 벚꽃길',
        description: '이번 주말이 딱 좋을 것 같아요!',
        image: '/images/peakStart.png',
        variant: 'big',
      },
    ],
  },
  {
    title: '지금 가기 딱 좋은 곳',
    description: '사진 한 장과 상태 선택으로\n타이밍 지도가 실시간으로 업데이트돼요',
    image: '/images/camera.png',
    Card: [
      {
        title: '만개',
        description: '지금 피크에요!',
        image: '/images/peak.png',
        variant: 'small',
      },
      {
        title: '피기시작',
        description: '1~2주 내 절정',
        image: '/images/peakStart.png',
        variant: 'small',
      },
      {
        title: '이르다',
        description: '미리 계획 중 ',
        image: '/images/sprout.png',
        variant: 'small',
      },
    ],
  },
] as const
