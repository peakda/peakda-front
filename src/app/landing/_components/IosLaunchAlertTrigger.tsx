'use client'

import { useState, type ReactNode } from 'react'
import { IosLaunchAlertModal } from '@/app/landing/_components/IosLaunchAlertModal'

interface IosLaunchAlertTriggerProps {
  className?: string
  children: ReactNode
}

// 랜딩 서버 컴포넌트에서 iOS 출시 알림 모달을 여는 버튼만 클라이언트로 뗀다
export function IosLaunchAlertTrigger({ className, children }: IosLaunchAlertTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && <IosLaunchAlertModal onClose={() => setOpen(false)} />}
    </>
  )
}
