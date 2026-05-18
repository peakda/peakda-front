import Button from '@/components/ui/button/Button'
import { cn } from '@/lib/utils/cn'
import AlarmAvatar from './AlarmAvatar'

export type AlarmType = 'timing' | 'reaction' | 'following' | 'notice'

export interface AlarmItemData {
  id: string
  type: AlarmType
  isRead: boolean
  title: string
  description?: string
  imageUrl?: string
  reactionEmoji?: string
  timestamp: string
  onFollowBack?: () => void
}

interface AlarmProps {
  item: AlarmItemData
}

export function Alarm({ item }: AlarmProps) {
  const { type, isRead, title, description, imageUrl, reactionEmoji, timestamp, onFollowBack } =
    item

  return (
    <div
      className={cn(
        'border-border-primary flex w-full items-start gap-3 border py-3',
        isRead ? 'opacity-70' : 'bg-bg-primary'
      )}
    >
      <div className="flex items-center gap-2 self-center">
        {!isRead && (
          <div className="flex w-1.5 shrink-0 items-center justify-center self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7F92]" />
          </div>
        )}
        <AlarmAvatar type={type} imageUrl={imageUrl} reactionEmoji={reactionEmoji} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('text-text-primary text-base font-semibold')}>{title}</p>
        {description && <p className="text-text-secondary mt-0.5 text-sm">{description}</p>}
        {type === 'following' && onFollowBack && (
          <div className="mt-1.5">
            <Button size="sm" variant="outlined" onClick={onFollowBack}>
              맞팔로우
            </Button>
          </div>
        )}
        <p className="text-text-tertiary mt-1 text-xs">{timestamp}</p>
      </div>
    </div>
  )
}
