'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { SocialLoginBtns } from '@/app/login/_components/SocialLoginBtns'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

export function LoginSheet() {
  const isOpen = useLoginSheetStore((s) => s.isOpen)
  const message = useLoginSheetStore((s) => s.message)
  const closeLoginSheet = useLoginSheetStore((s) => s.closeLoginSheet)

  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && closeLoginSheet()}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/40" />
        <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-100 mx-auto flex max-w-[430px] flex-col rounded-t-[20px] bg-white outline-none">
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-gray-300" />
          <div className="flex flex-col px-5 pt-7 pb-8">
            <VaulDrawer.Title className="text-text-primary text-xl font-bold">
              로그인이 필요해요
            </VaulDrawer.Title>
            <VaulDrawer.Description className="text-text-secondary mt-2 mb-9 text-[15px]">
              {message}
            </VaulDrawer.Description>
            <SocialLoginBtns />
            <button
              type="button"
              onClick={closeLoginSheet}
              className="text-text-secondary mx-auto mt-5 cursor-pointer text-sm"
            >
              나중에 할게요
            </button>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
