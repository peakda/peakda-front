'use client'

import { Button } from '@/components/ui/button/Button'

interface Props {
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmDrawerContent({ onConfirm, onClose }: Props) {
  return (
    <div className="flex flex-col gap-1 px-5 pt-2 pb-8 text-center">
      <h2 className="text-text-primary text-lg font-bold">이 기록을 삭제할까요?</h2>
      <p className="text-text-secondary mb-4 text-sm">삭제하면 다시 되돌릴 수 없어요.</p>
      <Button
        variant="filled"
        size="lg"
        className="bg-brand-warning hover:bg-brand-warning active:bg-brand-warning w-full text-white"
        onClick={onConfirm}
      >
        삭제
      </Button>
      <Button variant="ghost" color="default" size="lg" className="w-full" onClick={onClose}>
        취소
      </Button>
    </div>
  )
}
