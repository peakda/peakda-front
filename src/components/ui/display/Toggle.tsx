'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  initialStatus: boolean
  status?: boolean
  onChange?: (isOn: boolean) => void
  // 스크린리더가 읽을 이름. 화면에 보이는 설정 이름과 같게 둔다.
  label: string
}

export function Toggle({ initialStatus, status, onChange, label }: ToggleProps) {
  const [isOn, setIsOn] = useState(initialStatus)
  const currentStatus = status ?? isOn
  const onToggle = () => {
    const next = !currentStatus
    // onChange 는 updater 밖에서 부른다 — updater 는 StrictMode 에서 두 번 실행된다.
    if (status === undefined) setIsOn(next)
    onChange?.(next)
  }
  return (
    <button
      onClick={onToggle}
      type="button"
      role="switch"
      aria-checked={currentStatus}
      aria-label={label}
      className={cn(
        'relative inline-flex h-7 w-15 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none',
        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2',
        currentStatus ? 'bg-primary' : 'bg-bg-quaternary'
      )}
    >
      {/* 내부 원 (Handle) */}
      <span
        className={cn(
          'inline-block h-5 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out',
          currentStatus ? 'translate-x-7' : 'translate-x-1'
        )}
      />
    </button>
  )
}
