import { cn } from '@/lib/utils/cn'
import React, { ReactNode } from 'react'

type Variant = 'soft' | 'filled' | 'ghost'
type Color = 'gray' | 'pink' | 'white' | 'green'

interface Props {
  label: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  variant?: Variant
  color?: Color
  onClick?: () => void
}

const styles: Record<Variant, Record<Color, string>> = {
  soft: {
    gray: 'bg-slate-100 text-slate-500',
    pink: 'bg-pink-100 text-pink-500',
    white: 'bg-bg-secondary text-secondary',
    green: 'bg-green-100 text-green-600',
  },
  filled: {
    gray: 'bg-bg-tertiary text-text-tertiary',
    pink: 'bg-[#ffa8b43b]  text-flower-plum',
    white: 'bg-bg-secondary text-secondary',
    green: 'bg-green-50 text-brand-secondary',
  },
  ghost: {
    gray: 'text-text-quaternary border border-border-secondary hover:text-text-secondary ',
    pink: 'text-pink-500',
    white: 'text-secondary',
    green: 'text-green-600',
  },
}

export function Badge({
  label,
  leftIcon,
  rightIcon,
  className,
  variant = 'soft',
  color = 'gray',
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors duration-200',
        styles[variant][color],
        className
      )}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span className="text-sm font-medium">{label}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </div>
  )
}
