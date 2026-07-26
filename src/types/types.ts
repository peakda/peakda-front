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
