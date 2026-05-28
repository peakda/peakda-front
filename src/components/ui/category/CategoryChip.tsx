import { cn } from '@/lib/utils/cn'

export default function CategoryChip({
  label,
  selected,
  onClick,
  className,
}: {
  label: string
  selected: string
  onClick: () => void
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex h-[28px] w-[60px] cursor-pointer items-center justify-center rounded-full px-2 py-1',
        className,
        selected === label && 'bg-brand-secondary transition-colors duration-300'
      )}
    >
      <p
        className={cn(
          'text-sm',
          selected === label ? 'text-text-primary-inverse font-bold' : 'text-text-tertiary'
        )}
      >
        {label}
      </p>
    </div>
  )
}
