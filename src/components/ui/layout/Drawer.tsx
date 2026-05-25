'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { useState } from 'react'
import { useDrawerStore } from '@/stores/useDrawerStore'
import Button from '../button/Button'
import { FilterDrawerContent } from './FilterDrawerContent'
import PinList from '../display/PinList'

export function Drawer() {
  const { isOpen, type, pinListData, closeDrawer, setSnapHeight } = useDrawerStore()
  const [snap, setSnap] = useState<string | number | null>('400px')
  const snapPx = typeof snap === 'string' ? parseInt(snap) : typeof snap === 'number' ? snap : 400

  const snapPoints = ['400px', 0.9]

  function handleSnapChange(value: string | number | null) {
    setSnap(value)
    // isOpen 가드: Vaul이 닫힌 후 500ms 뒤에 snapPoints[0]으로 reset 호출하는데
    // 이때 isOpen=false이므로 setSnapHeight를 막아 LocationBtn이 튀는 현상을 방지
    if (typeof value === 'string' && isOpen) setSnapHeight(parseInt(value))
  }

  return (
    <VaulDrawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeDrawer()
          setSnap('400px')
        }
      }}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={handleSnapChange}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="pointer-events-none fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/10 opacity-100!" />

        <VaulDrawer.Content className="pointer-events-auto fixed right-0 bottom-0 left-0 z-100 mx-auto flex h-full max-w-[430px] flex-col overflow-hidden rounded-t-[20px] bg-white outline-none">
          <VaulDrawer.Title className="sr-only">
            {type === 'filter' ? '검색 필터' : '명소 정보'}
          </VaulDrawer.Title>

          <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />

          {type === 'filter' ? (
            <FilterDrawerContent snap={snap} onExpandToFull={() => setSnap(0.9)} />
          ) : pinListData.length > 0 ? (
            <div
              className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-24"
              style={{ maxHeight: `${snapPx - 30}px` }}
              data-vaul-no-drag
              onPointerDown={(e) => e.stopPropagation()}
            >
              {pinListData.map((pin, i) => (
                <PinList key={i} {...pin} />
              ))}
            </div>
          ) : null}

          <div
            className="absolute right-0 left-0 z-10 border-gray-100 bg-white p-4 transition-[bottom] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
            style={{ bottom: 'var(--snap-point-height, 0px)' }}
          >
            <Button
              variant="filled"
              size="lg"
              className="bg-brand-secondary active:bg-brand-secondary hover:bg-brand-secondary w-full cursor-pointer text-white"
              onClick={closeDrawer}
            >
              명소 보기
            </Button>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
