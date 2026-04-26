'use client'
import Header from '@/components/ui/Header'
import { Drawer } from '@/components/ui/Drawer'
import { ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { TermsForm } from './_components/TermsForm'

export default function TermsPage() {
  // const openDrawer = useDrawerStore((state) => state.openDrawer)

  return (
    <>
      <div className="relative flex h-dvh w-full flex-col">
        <div className="h-14">
          <Header
            left={<ChevronLeft className="cursor-pointer" />}
            center={<div className="text-[15px] font-medium text-[#000000]">서비스 이용 동의</div>}
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-2 p-5">
          <h2 className="text-xl font-semibold">서비스 이용 동의</h2>
          <p className="text-base font-normal">PEAKDA를 시작하기 전에 아래 내용을 확인해주세요.</p>
          <p className="text-base font-normal">필수 항목에 동의해야 서비스를 이용할 수 있어요.</p>
        </div>
        <div className="flex-1">
          <TermsForm />
        </div>
        <div className="absolute right-0 bottom-20 left-0 z-10 p-4">
          <Button
            variant="filled"
            size="lg"
            className="w-full cursor-pointer bg-[#98C96D] text-white hover:bg-[#98C96D]"
          >
            시작하기
          </Button>
        </div>
      </div>
      <Drawer />
    </>
  )
}
