import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

type Variant = 'soft' | 'filled' | 'ghost'
type Color = 'gray' | 'pink' | 'red' | 'green'

interface Props {
  label: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  variant?: Variant
  color?: Color
}

const styles: Record<Variant, Record<Color, string>> = {
  soft: {
    gray: 'bg-slate-100 text-slate-500',
    pink: 'bg-pink-100 text-pink-500',
    red: 'bg-red-100 text-red-500',
    green: 'bg-green-100 text-green-600',
  },
  filled: {
    gray: 'bg-slate-500 text-white',
    pink: 'bg-pink-400 text-white',
    red: 'bg-red-400 text-white',
    green: 'bg-green-500 text-white',
  },
  ghost: {
    gray: 'text-[#D0D4DB] border border-var(--border-secondary)',
    pink: 'text-pink-500',
    red: 'text-red-500',
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
}: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1',
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
