import { Heart, MapPin, Plus } from 'lucide-react'
import Button from '@/components/ui/button/Button'
import IconBtn from '@/components/ui/button/IconBtn'

export function SavedSpotEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <IconBtn className="h-16 w-16">
        <Heart className="text-icon-secondary h-8 w-8" strokeWidth={1.5} />
      </IconBtn>
      <p className="text-text-primary text-base font-semibold">아직 저장한 스팟이 없어요</p>
      <p className="text-text-tertiary text-sm">
        관심 가는 스팟을 저장하면 만개 시점에 알림이 와요
      </p>
      <Button
        variant="filled"
        color="primary"
        size="lg"
        leftIcon={<Plus className="h-4 w-4" />}
        className="mt-2"
      >
        찜 명소 추가하기
      </Button>
    </div>
  )
}
