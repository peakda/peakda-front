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

export interface PinBadge {
  label: string
  // 라벨 왼쪽 꽃 아이콘. 개화 정보가 없으면 아이콘 없이 라벨만 보여준다.
  icon?: string
}

interface BasePinProps {
  tagText?: string
  title: string
  location: string
  description: string
  // 한 스팟에 여러 꽃이 피어 있을 수 있어 배열이다. 꽃마다 아이콘이 달라 라벨과 쌍으로 든다.
  badges: PinBadge[]
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
