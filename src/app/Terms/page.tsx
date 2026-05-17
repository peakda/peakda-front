'use client'
import Header from '@/components/ui/Header'
import { Drawer } from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { TermsForm } from './_components/TermsForm'
import LeftArrow from '@/components/ui/LeftArrow'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  const [canSubmit, setCanSubmit] = useState(false)

  return (
    <>
      <div className="relative flex h-dvh w-full flex-col py-11">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">서비스 이용 동의</div>}
        />

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h2 className="text-color-var(--icon-quaternary) text-xl! font-semibold! tracking-tight">
            서비스 이용 동의
          </h2>
          <p className="text-text-secondary text-[15px] font-normal">
            PEAKDA를 시작하기 전에 아래 내용을 확인해주세요.
          </p>
          <p className="text-text-secondary text-[15px] font-normal">
            필수 항목에 동의해야 서비스를 이용할 수 있어요.
          </p>
        </div>
        <div className="flex-1">
          <TermsForm onRequiredChange={setCanSubmit} />
        </div>
        <div className="absolute right-0 bottom-10 left-0 z-10 flex-1 p-4">
          <Button
            variant="filled"
            size="lg"
            disabled={!canSubmit}
            onClick={() => router.push('/profile')}
            className="bg-brand-secondary hover:bg-brand-secondary active:bg-brand-secondary w-full cursor-pointer text-white disabled:cursor-not-allowed"
          >
            시작하기
          </Button>
        </div>
      </div>
      <Drawer />
    </>
  )
}
