'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Toggle } from '@/components/ui/display/Toggle'
import { Drawer } from '@/components/ui/layout/Drawer'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { BlockedUsersSection } from '@/app/my/settings/_components/BlockedUsersSection'
import type { LegalSlug } from '@/app/Terms/_data/legal-content'

const INFO_LINKS: { label: string; slug: LegalSlug }[] = [
  { label: '이용약관', slug: 'terms-of-service' },
  { label: '개인정보처리방침', slug: 'privacy-policy' },
  { label: '마케팅푸시알림', slug: 'marketing-push-consent' },
]

function SectionTitle({ children }: { children: string }) {
  return <p className="text-text-tertiary px-4 pt-5 pb-1 text-sm">{children}</p>
}

export default function SettingsPage() {
  const openLogoutDrawer = useDrawerStore((s) => s.openLogoutDrawer)
  const openWithdrawDrawer = useDrawerStore((s) => s.openWithdrawDrawer)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">앱 설정</div>}
        />
      </div>

      {/* 서비스 */}
      <SectionTitle>서비스</SectionTitle>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <span className="text-text-primary text-base">위치 정보 활용</span>
          <span className="text-text-tertiary text-sm">내 위치 기반 추천</span>
        </div>
        <Toggle initialStatus={true} />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <span className="text-text-primary text-base">EXIF 데이터 자동 추출</span>
          <span className="text-text-tertiary text-sm">사진에서 위치·날짜 자동 입력</span>
        </div>
        <Toggle initialStatus={true} />
      </div>

      <div className="bg-bg-secondary h-2" />

      {/* 정보 */}
      <SectionTitle>정보</SectionTitle>
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="text-text-primary text-base">앱 버전</span>
        <span className="text-text-tertiary text-sm">1.0.0</span>
      </div>
      {INFO_LINKS.map(({ label, slug }) => (
        <Link
          key={slug}
          href={`/Terms/${slug}`}
          className="flex cursor-pointer items-center justify-between px-4 py-3.5"
        >
          <span className="text-text-primary text-base">{label}</span>
          <ChevronRight className="text-icon-quaternary h-5 w-5 scale-x-150 scale-y-150" />
        </Link>
      ))}

      <div className="bg-bg-secondary h-2" />

      {/* 차단한 사용자 */}
      <BlockedUsersSection />

      <div className="bg-bg-secondary h-2" />

      {/* 계정 */}
      <SectionTitle>계정</SectionTitle>
      <button
        type="button"
        onClick={openLogoutDrawer}
        className="cursor-pointer px-4 py-3.5 text-left"
      >
        <span className="text-text-primary text-base">로그아웃</span>
      </button>
      <button
        type="button"
        onClick={openWithdrawDrawer}
        className="cursor-pointer px-4 py-3.5 text-left"
      >
        <span className="text-base text-rose-500">계정 탈퇴</span>
      </button>

      <Drawer />
    </div>
  )
}
