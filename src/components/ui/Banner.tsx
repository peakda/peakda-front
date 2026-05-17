import { cn } from '@/lib/utils/cn'

interface BannerProps {
  title: string
  description?: string
  variant?: 'now' | 'peak' | 'disabled' | 'empty'
}

const variantStyles = {
  now: {
    container: 'bg-green-50',
    title: 'text-green-500',
    desc: 'text-green-500',
  },
  peak: {
    container: 'bg-yellow-50',
    title: 'text-yellow-600',
    desc: 'text-yellow-600',
  },
  disabled: {
    container: 'bg-bg-secondary',
    title: 'text-text-secondary',
    desc: 'text-text-secondary',
  },
  empty: {
    container: 'bg-bg-secondary',
    title: 'text-text-secondary',
    desc: 'text-text-secondary',
  },
}

export default function Banner({ title, description, variant = 'now' }: BannerProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-md px-3 py-2 text-center',
        styles.container
      )}
    >
      <p className={cn('text-[15px] font-medium', styles.title)}>{title}</p>

      {description && <p className={cn('text-xs font-normal', styles.desc)}>{description}</p>}
    </div>
  )
}
