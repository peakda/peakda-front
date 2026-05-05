import React from 'react'
import { cn } from '@/lib/utils/cn'

export type BorderVariant = 'none' | 'secondary' | 'border-secondary' | 'warning'

const borderVariantClass: Record<BorderVariant, string> = {
  none: 'border-[var(--border-primary)]',
  secondary: 'border-[var(--colors-secondary)]',
  'border-secondary': 'border-secondary',
  warning: 'border-[var(--color-brand-warning)]',
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: BorderVariant
  error?: boolean
}

const Input = ({ variant = 'warning', error, className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        'bg-var(--bg-secondary) border-secondary h-12 w-full rounded-3xl border p-3 transition-all focus:ring-1 focus:ring-blue-100 focus:outline-none',
        'placeholder:text-sm placeholder:text-slate-300',
        borderVariantClass[variant],
        error && 'border-rose-400 focus:ring-rose-100',
        props.disabled && 'bg-slate-100 text-slate-400',
        className
      )}
      {...props}
    />
  )
}

export default Input
