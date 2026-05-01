import { cn } from '@/lib/utils/cn'
import { CardProps } from '@/types/types'

export default function Card({
  variant,
  image,
  title,
  description,
  onClick,
  className,
}: CardProps) {
  const isBig = variant === 'big'
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} 카드`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'rounded-xl bg-[#F8F9FB] transition-colors',
        isBig
          ? 'flex w-full items-center gap-1 px-2 py-3.5'
          : 'flex flex-col items-center gap-0.5 px-3 py-3.5 text-center',
        className
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center',
          isBig ? 'h-16 w-16 rounded-lg' : 'h-8 w-8'
        )}
      >
        <img
          src={image}
          alt={title}
          aria-hidden
          className={cn(isBig ? 'h-8 w-8 rounded-lg object-cover' : 'h-6 w-6 object-cover')}
        />
      </div>

      {/* Body */}
      <div className="w-full min-w-0 space-y-1">
        <p
          className={cn(
            'text-foreground mb-0.5 truncate font-bold',
            isBig ? 'text-[15px]' : 'text-[13px]'
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-muted-foreground truncate font-normal text-gray-500',
            isBig ? 'text-[13px]' : 'text-[11px]'
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
