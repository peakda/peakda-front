'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Button from '@/components/ui/button/Button'
import { cn } from '@/lib/utils/cn'

interface Props {
  onClose: () => void
}

const NOTICES = [
  '방문 기록 24개 · 방문 예정이 모두 삭제돼요',
  '찜·저장한 스팟과 만개 알림이 사라져요',
  '동일 계정 재가입 시 데이터 복구가 불가능해요',
]

export function WithdrawDrawerContent({ onClose }: Props) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="flex flex-col gap-1 px-5 pt-2 pb-8 text-center">
      <h2 className="text-text-primary text-lg font-bold">정말 탈퇴하실건가요?</h2>
      <p className="text-text-secondary mb-3 text-sm">
        탈퇴시 기록·저장 내역이 모두 사라지고,
        <br /> 복구할 수 없어요.
      </p>

      {/* 주의 사항 */}
      <div className="bg-bg-secondary mb-3 flex flex-col gap-2 rounded-xl p-4 text-left">
        <p className="text-text-primary text-sm font-semibold">계정 탈퇴 주의 사항</p>
        <ul className="flex flex-col gap-1.5">
          {NOTICES.map((notice) => (
            <li key={notice} className="text-text-secondary flex gap-1.5 text-sm">
              <span className="text-text-tertiary">·</span>
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-text-primary w-full text-left font-semibold">
        위 내용을 읽고 동의하시면 확인을 해주세요.
      </p>
      {/* 동의 체크 */}
      <button
        type="button"
        onClick={() => setAgreed((prev) => !prev)}
        className="mb-3 flex cursor-pointer items-center gap-2"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
            agreed ? 'border-brand-secondary bg-brand-secondary' : 'border-gray-300 bg-white'
          )}
        >
          {agreed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </span>

        <span className="text-text-primary text-sm">계정 탈퇴 내용을 동의합니다.</span>
      </button>

      <Button
        variant="filled"
        color="primary"
        size="lg"
        disabled={!agreed}
        onClick={onClose}
        className="bg-brand-warning hovebg-brand-warning active: bg-brand-warning w-full text-white"
      >
        계정 탈퇴 및 데이터 삭제
      </Button>
    </div>
  )
}
