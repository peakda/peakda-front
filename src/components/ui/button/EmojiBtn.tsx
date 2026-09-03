'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { toTwemojiUrl } from '@/lib/utils/emoji'

interface EmojiBtnProps {
  emoji: string
  label?: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function EmojiBtn({ emoji, label, selected = false, onClick, className }: EmojiBtnProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-green-300 bg-green-50 text-green-600'
          : 'border-border-primary bg-bg-primary text-text-secondary',
        className
      )}
    >
      <Image src={toTwemojiUrl(emoji)} alt={emoji} width={16} height={16} />
      {label && <span>{label}</span>}
    </button>
  )
}
