'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

// 데스크톱 헤더에만 있는 섹션 이동 링크
const NAV_LINKS = [
  { label: '소개', id: 'intro' },
  { label: '기능', id: 'features' },
  { label: '알림 신청', id: 'waitlist' },
  { label: 'FAQ', id: 'faq' },
]

// 지금 보고 있는 섹션의 메뉴를 녹색으로 표시한다. 메뉴에 없는 섹션을 지나는 동안은 직전 표시를 유지한다.
export const LandingNav = () => {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id)
        }),
      { rootMargin: '-15% 0px -60% 0px' }
    )
    NAV_LINKS.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="랜딩 섹션" className="hidden xl:block">
      <ul className="flex gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              aria-current={current === link.id ? 'location' : undefined}
              className={cn(
                'text-[15px] leading-[1.3] font-medium transition-colors duration-200 hover:text-green-600',
                current === link.id ? 'text-green-600' : 'text-gray-700'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
