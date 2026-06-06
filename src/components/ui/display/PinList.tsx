import Image from 'next/image'
import PinText from './PinText'
import { MultiImageProps } from '@/types/types'
import { cn } from '@/lib/utils/cn'

export default function PinList(props: MultiImageProps) {
  const { title, location, description, Badges, isFavorite, tagText, type } = props

  return (
    <div className="flex w-full flex-col border-b border-gray-100">
      <PinText
        Badges={Badges}
        description={description}
        isFavorite={isFavorite}
        location={location}
        title={title}
        tag={tagText}
        variant={type}
      />

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {props.images.map((src, idx) => (
          <div
            key={idx}
            className={cn('relative aspect-square overflow-hidden rounded-md', !src && 'bg-gray-100')}
          >
            {src && (
              <Image
                src={src}
                alt={`${title}-${idx}`}
                fill
                sizes="(max-width: 430px) 33vw, 130px"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
