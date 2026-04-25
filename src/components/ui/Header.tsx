import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}

const Header = ({ left, center, right, className }: HeaderProps) => {
  return (
    <header className={cn('absolute top-0 z-50 flex h-14 w-full items-center px-4', className)}>
      {/* Left */}
      <div className="flex flex-1 items-center justify-start">{left}</div>

      {/* Center */}
      <div className="flex items-center justify-center">{center}</div>

      {/* Right */}
      <div className="flex flex-1 items-center justify-end">{right}</div>
    </header>
  )
}

export default Header
