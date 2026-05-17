import React from 'react'
import { cn } from '@/lib/utils/cn'
import { type BorderVariant } from './Input'

const borderVariantClass: Record<BorderVariant, string> = {
  none: 'border-[var(--border-primary)]',
  secondary: 'border-[var(--colors-secondary)]',
  warning: 'border-[var(--color-brand-warning)]',
}

const MAX_LENGTH = 1000

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: BorderVariant
  error?: boolean
}

const Textarea = ({
  variant = 'warning',
  error,
  className,
  value,
  maxLength = MAX_LENGTH,
  ...props
}: TextareaProps) => {
  const currentLength = value?.toString().length ?? 0

  return (
    <div className="relative w-full">
      <textarea
        className={cn(
          'bg-bg-secondary w-full resize-none rounded-2xl border p-3 pb-8 transition-all focus:ring-1 focus:ring-blue-100 focus:outline-none',
          'placeholder:text-sm placeholder:text-slate-300',
          borderVariantClass[variant],
          error && 'border-rose-400 focus:ring-rose-100',
          props.disabled && 'bg-slate-100 text-slate-400',
          className
        )}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      <span className="absolute right-3 bottom-3 text-xs text-slate-300">
        {currentLength}/{maxLength}
      </span>
    </div>
  )
}

export default Textarea
