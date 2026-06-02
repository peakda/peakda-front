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

const IMAGESIZE: Record<AvatarSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function Avatar({ imageUrl, size = 'sm', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'bg-bg-tertiary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        SIZE[size],
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" />
      ) : (
        <Image
          src="/icons/person.svg"
          alt=""
          width={30}
          height={30}
          className={cn('object-cover', IMAGESIZE[size])}
        />
      )}
    </div>
  )
}
