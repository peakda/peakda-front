import React from 'react'
import { cn } from '@/lib/utils/cn'

export type BorderVariant = 'none' | 'secondary' | 'warning'

const borderVariantClass: Record<BorderVariant, string> = {
  none: 'border-border-primary bg-bg-secondary',
  secondary: 'border-border-secondary',
  warning: 'border-[var(--color-brand-warning)]',
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: BorderVariant
  error?: boolean
}

const Input = ({ variant = 'none', error, className, ...props }: InputProps) => {
  const hasValue = typeof props.value === 'string' && props.value.length > 0

  return (
    <input
      className={cn(
        'bg-bg-secondary focus:border-brand-secondary h-12 w-full rounded-3xl border p-3 transition-all focus:outline-none',
        'placeholder:text-sm placeholder:text-slate-300',
        borderVariantClass[variant],
        hasValue && 'border-border-secondary',
        error && 'border-rose-400 focus:ring-rose-100',
        props.disabled && 'bg-slate-100 text-slate-400',
        className
      )}
      {...props}
    />
  )
}

export default Input
