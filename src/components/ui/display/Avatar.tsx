import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  imageUrl?: string | null
  size?: AvatarSize
  className?: string
}

const SIZE: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
}

export function Avatar({ imageUrl, size = 'sm', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'bg-bg-tertiary relative shrink-0 overflow-hidden rounded-full',
        SIZE[size],
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" />
      ) : (
        <Image src="/icons/person.svg" alt="" fill className="object-cover" />
      )}
    </div>
  )
}
