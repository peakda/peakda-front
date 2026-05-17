'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { useState } from 'react'
import { useDrawerStore } from '@/stores/useDrawerStore'
import Button from './Button'

export function Drawer() {
  const [activeTab, setActiveTab] = useState<'region' | 'timing' | 'flowers'>('region')
  const { isOpen, closeDrawer } = useDrawerStore()
  const [snap, setSnap] = useState<string | number | null>('400px')

  return (
    <VaulDrawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && closeDrawer()}
      snapPoints={['400px', '700px', 0.95]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="pointer-events-none fixed inset-0 z-100 mx-auto max-w-125 bg-black/40 opacity-100!" />

        <VaulDrawer.Content className="pointer-events-auto fixed right-0 bottom-0 left-0 z-100 mx-auto flex h-full max-w-125 flex-col overflow-hidden rounded-t-[20px] bg-white outline-none">
          <VaulDrawer.Title className="sr-only">검색 필터</VaulDrawer.Title>

          <div className="flex-none rounded-t-[20px] bg-white">
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />
            <div className="flex border-b border-gray-100">
              {(['지역', '시기', '꽃 종류'] as const).map((tab, idx) => {
                const tabValue = (['region', 'timing', 'flowers'] as const)[idx]
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tabValue)}
                    className={`flex-1 py-4 text-[15px] font-medium transition-colors ${
                      activeTab === tabValue
                        ? 'border-b-2 border-pink-400 text-pink-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-4 pb-24">
            {activeTab === 'region' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">권역 선택</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="rounded-xl border border-pink-200 bg-pink-50 p-4 text-left">
                    <span className="block text-sm font-bold text-pink-500">수도권</span>
                    <span className="text-[11px] text-gray-400">서울 · 경기 · 인천 등</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'flowers' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800">봄</h3>
                <div className="grid grid-cols-4 gap-y-6">
                  {['매화', '동백꽃', '벚꽃', '개나리'].map((flower) => (
                    <div key={flower} className="flex flex-col items-center">
                      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                        🌸
                      </div>
                      <span className="text-xs font-medium text-gray-700">{flower}</span>
                      <span className="text-[10px] text-gray-400">3-4월</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="absolute right-0 left-0 z-10 border-gray-100 bg-white p-4 transition-[bottom] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
            style={{ bottom: 'var(--snap-point-height, 0px)' }}
          >
            <Button
              variant="filled"
              size="lg"
              className="w-full cursor-pointer bg-[#98C96D] text-white hover:bg-[#98C96D]"
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
