'use client'
import Header from '@/components/ui/Header'
import { Drawer } from '@/components/ui/Drawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
  const openDrawer = useDrawerStore((state) => state.openDrawer)

  return (
    <>
      <div className="relative h-dvh w-full">
        <Header
          left={<ChevronLeft className="" />}
          center={<div className="text-[15px] font-medium text-[#000000]">서비스 이용 동의</div>}
        />
        <button className="absolute top-96 flex items-center justify-center" onClick={openDrawer}>
          검색 필터 보기
        </button>
      </div>
      <Drawer />
    </>
  )
}
