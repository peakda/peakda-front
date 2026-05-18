import Image from 'next/image'
import { AlarmItemData } from './Alarm'

export default function AlarmAvatar({
  type,
  imageUrl,
  reactionEmoji,
}: Pick<AlarmItemData, 'type' | 'imageUrl' | 'reactionEmoji'>) {
  const hasProfileImage = type === 'reaction' || type === 'following'

  return (
    <div className="relative flex shrink-0 self-center">
      {hasProfileImage ? (
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
          {imageUrl && <Image src={imageUrl} alt="" className="h-full w-full object-cover" />}
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full">
          <Image
            src={'./icons/favicon.svg'}
            alt="이미지"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </div>
      )}
      {type === 'reaction' && reactionEmoji && (
        <span className="absolute -right-0.5 -bottom-0.5 text-sm leading-none">
          {reactionEmoji}
        </span>
      )}
    </div>
  )
}
