import { cn } from '@/lib/utils/cn'

type CardBadgeVariant = 'dark' | 'bloom' | 'secondary' | 'green'

interface Props {
  label: string
  variant: CardBadgeVariant
  className?: string
}

const variantStyles: Record<CardBadgeVariant, string> = {
  dark: 'bg-bg-quaternary-80 text-white rounded',
  bloom: 'bg-rose-400 text-white rounded-full',
  secondary: 'bg-bg-secondary text-text-secondary rounded',
  green: 'bg-green-50 text-brand-secondary rounded',
}

export function CardBadge({ label, variant, className }: Props) {
  return (
    <span className={cn('px-2 py-1 text-[10px] leading-none', variantStyles[variant], className)}>
      {label}
    </span>
  )
}
