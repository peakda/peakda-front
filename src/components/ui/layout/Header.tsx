import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}

export const Header = ({ left, center, right, className }: HeaderProps) => {
  return (
    <>
      {/* iOS 상태바 영역 — 뒤 배경(이미지 등)이 비치지 않도록 흰색으로 고정 */}
      <div className="absolute left-0 top-[calc(env(safe-area-inset-top)*-1)] z-50 h-[env(safe-area-inset-top)] w-full bg-white" />
      <header className={cn('absolute top-0 z-50 flex h-[36px] w-full items-center px-4', className)}>
        {/* Left */}
        <div className="flex flex-1 items-center justify-start">{left}</div>

        {/* Center */}
        <div className="flex items-center justify-center">{center}</div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-end">{right}</div>
      </header>
    </>
  )
}

