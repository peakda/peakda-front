import React from 'react'
import { cn } from '@/lib/utils/cn'

export type BorderVariant = 'none' | 'secondary' | 'warning'

const borderVariantClass: Record<BorderVariant, string> = {
  none: 'border-border-primary focus:border-border-secondary bg-bg-secondary',
  secondary: 'border-border-secondary ',
  warning: 'border-[var(--color-brand-warning)]',
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: BorderVariant
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = ({ variant = 'none', error, leftIcon, rightIcon, className, ...props }: InputProps) => {
  const hasValue = typeof props.value === 'string' && props.value.length > 0

  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">{leftIcon}</span>
      )}
      {rightIcon && (
        <span className="absolute top-1/2 right-3 -translate-y-1/2">{rightIcon}</span>
      )}
      <input
        className={cn(
          'bg-bg-secondary focus:border-brand-secondary h-12 w-full rounded-3xl border p-3 transition-all focus:outline-none',
          'placeholder:text-text-tertiary placeholder:text-base',
          borderVariantClass[variant],
          hasValue && 'border-border-secondary',
          error && 'border-rose-400 focus:ring-rose-100',
          props.disabled && 'bg-slate-100 text-slate-400',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
    </div>
  )
}

export default Input
