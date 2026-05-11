export interface CardProps {
  variant?: 'big' | 'small'
  image: string
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export interface stepProps {
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
