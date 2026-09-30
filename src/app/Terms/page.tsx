import { Header } from '@/components/ui/layout/Header'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { TermsAgreement } from '@/app/Terms/_components/TermsAgreement'

export default function TermsPage() {
  return (
    <>
      <div className="relative flex h-dvh w-full flex-col py-11">
        <Header
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
        <TermsAgreement />
      </div>
      <LazyDrawer />
    </>
  )
}
