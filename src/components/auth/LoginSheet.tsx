'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { Button } from '@/components/ui/button/Button'
import { SocialLoginBtns } from '@/app/login/_components/SocialLoginBtns'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

// TODO(디자인): 임시 레이아웃. 시안이 나오면 이 컴포넌트 내용만 교체한다 (여는 쪽은 useRequireLogin).
export function LoginSheet() {
  const isOpen = useLoginSheetStore((s) => s.isOpen)
  const closeLoginSheet = useLoginSheetStore((s) => s.closeLoginSheet)

  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && closeLoginSheet()}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/40" />
        <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-100 mx-auto flex max-w-[430px] flex-col rounded-t-[20px] bg-white outline-none">
          <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />
          <div className="flex flex-col gap-1 px-5 pt-2 pb-8 text-center">
            <VaulDrawer.Title className="text-text-primary text-lg font-bold">
              로그인이 필요해요
            </VaulDrawer.Title>
            <VaulDrawer.Description className="text-text-secondary mb-5 text-sm">
              로그인하고 찜·기록·반응을 남겨보세요.
            </VaulDrawer.Description>
            <SocialLoginBtns />
            <Button
              variant="ghost"
              color="default"
              size="lg"
              className="mt-2 w-full"
              onClick={closeLoginSheet}
            >
              다음에 할게요
            </Button>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
