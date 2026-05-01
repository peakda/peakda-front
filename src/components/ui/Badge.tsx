import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface Props {
  label: string
  leftIcon?: ReactNode
  className?: string
  variant?: 'outline' | 'color'
}

export function Badge({ label, leftIcon, className, variant }: Props) {
  return (
    <div className={(cn('rounded-xl px-4 py-2'), className)}>
      {leftIcon}
      <span className="text-sm">{label}</span>
    </div>
  )
}
