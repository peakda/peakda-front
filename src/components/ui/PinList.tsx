import Image from 'next/image'
import PinText from './PinText'
import { MultiImageProps } from '@/types/types'

export default function PinList(props: MultiImageProps) {
  const { title, location, description, Badges, isFavorite, tagText, type } = props

  return (
    <div className="flex w-full flex-col border">
      <PinText
        Badges={Badges}
        description={description}
        isFavorite={isFavorite}
        location={location}
        title={title}
        tag={tagText}
        variant={type}
      />

      <div className="flex px-2 pb-2">
        {props.images.map((src, idx) => (
          <Image
            key={idx}
            src={src}
            alt={`${title}-${idx}`}
            width={100}
            height={100}
            className="flex-shrink-0 rounded-md object-cover"
          />
        ))}
      </div>
    </div>
  )
}
