import { Check } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { Button } from '@/components/ui/button/Button'

interface RecordCompleteViewProps {
  onGoToMap: () => void
  onRecordAgain: () => void
  onExit: () => void
}

export function RecordCompleteView({ onGoToMap, onRecordAgain, onExit }: RecordCompleteViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header center={<span className="text-[15px] font-medium">스팟 기록</span>} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <Check size={36} className="text-brand-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">기록이 등록되었어요!</h2>
          <p className="text-text-tertiary text-sm">지도 속 타이밍에 반영해보아요</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 pb-8">
        <Button variant="filled" color="primary" size="lg" onClick={onGoToMap}>
          지도로 확인하기
        </Button>
        <Button variant="outlined" color="primary" size="lg" onClick={onRecordAgain}>
          계속 기록하기
        </Button>
        <Button variant="ghost" color="default" size="lg" onClick={onExit}>
          종료
        </Button>
      </div>
    </div>
  )
}
