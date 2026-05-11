import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

type IconBtnSize = 'lg' | 'md' | 'sm'

interface IconBtnProps {
  children: ReactNode
  size?: IconBtnSize
  className?: string
}
const BASE =
  'items-center justify-center flex rounded-full transition-colors duration-200 cursor-pointer bg-white border border-border-primary'

const SIZE: Record<IconBtnSize, string> = {
  lg: 'h-12 w-12 p-1 ',
  md: 'h-8 w-8  p-1 ',
  sm: 'h-6 w-6 p-1',
}
export default function IconBtn({ size = 'lg', className = '', children }: IconBtnProps) {
  return <div className={cn(BASE, SIZE[size], className)}>{children}</div>
}
