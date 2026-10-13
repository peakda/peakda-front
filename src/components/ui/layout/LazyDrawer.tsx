'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useDrawerStore } from '@/stores/useDrawerStore'

// 드로어는 vaul 과 시트 컨텐츠를 끌고 와 페이지 첫 번들을 키운다(라우트당 약 30kB). 대부분의 방문에선
// 열리지 않으므로 처음 열릴 때 받아 오고, 한 번 받은 뒤에는 닫힘 애니메이션을 위해 계속 마운트해 둔다.
// 지도에서도 타일 준비 후 이 래퍼를 쓰되 실제 드로어 코드는 처음 열 때 받는다.
const Drawer = dynamic(
  () => import('@/components/ui/layout/Drawer').then((m) => ({ default: m.Drawer })),
  { ssr: false }
)

export function LazyDrawer() {
  const isOpen = useDrawerStore((s) => s.isOpen)
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)
  return hasOpened ? <Drawer /> : null
}
