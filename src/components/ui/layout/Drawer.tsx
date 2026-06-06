'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { useState, useEffect } from 'react'
import { useDrawerStore } from '@/stores/useDrawerStore'
import Button from '../button/Button'
import { FilterDrawerContent } from './FilterDrawerContent'
import { LogoutDrawerContent } from './LogoutDrawerContent'
import { WithdrawDrawerContent } from './WithdrawDrawerContent'
import { SaveSpotDrawerContent } from './SaveSpotDrawerContent'
import PinList from '../display/PinList'

export function Drawer() {
  const { isOpen, type, pinListData, saveSpotData, closeDrawer, setSnapHeight } = useDrawerStore()
  const [snap, setSnap] = useState<string | number | null>('400px')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  const snapPx =
    typeof snap === 'string'
      ? parseInt(snap)
      : typeof snap === 'number' && snap <= 1
        ? Math.round(snap * (typeof window !== 'undefined' ? window.innerHeight : 800))
        : typeof snap === 'number'
          ? snap
          : 400

  // 로그아웃 / 회원탈퇴 / 찜 확인 시트: snap 없이 콘텐츠 높이에 맞춰 올라오는 바텀시트
  if (type === 'logout' || type === 'withdraw' || type === 'save-spot') {
    const title = type === 'logout' ? '로그아웃' : type === 'withdraw' ? '계정 탈퇴' : '찜 추가'
    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className="fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/40" />
          <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-100 mx-auto flex max-w-[430px] flex-col rounded-t-[20px] bg-white outline-none">
            <VaulDrawer.Title className="sr-only">{title}</VaulDrawer.Title>
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />
            {type === 'logout' ? (
              <LogoutDrawerContent onClose={closeDrawer} />
            ) : type === 'withdraw' ? (
              <WithdrawDrawerContent onClose={closeDrawer} />
            ) : saveSpotData ? (
              <SaveSpotDrawerContent spot={saveSpotData} onClose={closeDrawer} />
            ) : null}
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

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

          <div className="bg-icon-quaternary mx-auto mt-4 mb-2 h-1 w-12 shrink-0 rounded-full" />

          {type === 'filter' || type === 'flower-filter' ? (
            <FilterDrawerContent
              snap={snap}
              onExpandToFull={() => setSnap(0.9)}
              flowersOnly={type === 'flower-filter'}
            />
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
