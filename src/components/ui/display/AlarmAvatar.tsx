import Image from 'next/image'
import { AlarmItemData } from './Alarm'
import { Avatar } from './Avatar'

export default function AlarmAvatar({
  type,
  imageUrl,
  reactionEmoji,
}: Pick<AlarmItemData, 'type' | 'imageUrl' | 'reactionEmoji'>) {
  const hasProfileImage = type === 'reaction' || type === 'following'

  return (
    <div className="relative flex shrink-0 self-center">
      {hasProfileImage ? (
        <Avatar imageUrl={imageUrl} />
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
