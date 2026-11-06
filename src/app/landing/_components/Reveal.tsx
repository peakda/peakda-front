'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface RevealProps {
  children: ReactNode
  className?: string
}

// 화면에 들어오면 data-shown 을 한 번 붙인다. 안쪽 .reveal-item 이 떠오르는 효과는 globals.css,
// 그 밖의 연출은 group-data-shown/reveal: 변형으로 건다.
export const Reveal = ({ children, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal=""
      data-shown={shown || undefined}
      className={cn('group/reveal', className)}
    >
      {children}
    </div>
  )
}
