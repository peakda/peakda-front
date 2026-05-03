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
