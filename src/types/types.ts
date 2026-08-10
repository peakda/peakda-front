export interface CardProps {
  variant?: 'big' | 'small'
  image: string
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export interface StepProps {
  title: string
  description: string
  image: string
  Card?: CardProps[]
}

interface BasePinProps {
  tagText?: string
  title: string
  location: string
  description: string
  Badges: string[]
  // 뱃지 왼쪽 꽃 아이콘. 개화 정보가 없으면 아이콘 없이 라벨만 보여준다.
  badgeIcon?: string
  isFavorite: boolean
  // 스팟 상세(/spot/[id]) 이동용. 좌표만 있는 핀 등 없을 수 있어 optional.
  spotId?: number
}

export interface SingleImageProps extends BasePinProps {
  type: 'card'
  imageUrl: string
}

export interface MultiImageProps extends BasePinProps {
  type: 'list'
  images: string[]
}

export type PinProps = SingleImageProps | MultiImageProps
