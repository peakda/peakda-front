import { cn } from '@/lib/utils/cn'

export type CardBadgeVariant = 'dark' | 'bloom' | 'secondary' | 'green' | 'starting' | 'late'

interface Props {
  label: string
  variant: CardBadgeVariant
  className?: string
}

// 개화 단계 색: green(이르다) → starting(피기 시작) → bloom(절정) → late(늦었다)
// 절정만 솔리드 pink-400 + 흰 텍스트, 나머지는 연한 배경 + 단계 색 텍스트.
const variantStyles: Record<CardBadgeVariant, string> = {
  dark: 'bg-bg-quaternary-80 text-white rounded',
  bloom: 'bg-pink-400 text-white rounded-full',
  secondary: 'bg-bg-secondary text-text-secondary rounded',
  green: 'bg-green-50 text-brand-secondary rounded',
  starting: 'bg-pink-50 text-pink-200 rounded',
  late: 'bg-pink-50 text-pink-600 rounded',
}

export function CardBadge({ label, variant, className }: Props) {
  return (
    <span className={cn('px-2 py-1 text-[10px] leading-none', variantStyles[variant], className)}>
      {label}
    </span>
  )
}
