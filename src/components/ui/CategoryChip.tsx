import { cn } from '@/lib/utils/cn'

export default function CategoryChip({ label, selected }: { label: string; selected: string }) {
  return (
    <div
      className={cn(
        'flex h-[28px] w-[58px] items-center justify-center rounded-full px-2 py-1',
        selected === label && 'bg-brand-secondary'
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
