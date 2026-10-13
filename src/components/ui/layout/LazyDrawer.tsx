'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useDrawerStore } from '@/stores/useDrawerStore'

// 드로어는 vaul 과 시트 컨텐츠를 끌고 와 페이지 첫 번들을 키운다(라우트당 약 30kB). 대부분의 방문에선
// 열리지 않으므로 처음 열릴 때 받아 오고, 한 번 받은 뒤에는 닫힘 애니메이션을 위해 계속 마운트해 둔다.
// 지도(MapContainer)는 이미 SDK 준비 후 따로 dynamic import 해 쓰므로 여기에 해당하지 않는다.
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
