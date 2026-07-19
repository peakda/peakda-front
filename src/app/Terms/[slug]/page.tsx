import LeftArrow from '@/components/ui/button/LeftArrow'
import Header from '@/components/ui/layout/Header'
import { notFound } from 'next/navigation'
import { LEGAL_CONTENT, type LegalSlug } from '../_data/legal-content'
import { LegalDocumentView } from '../_components/LegalDocumentView'

interface PageProps {
  params: Promise<{ slug: string }>
}

const HEADER_TITLE: Record<LegalSlug, string> = {
  'terms-of-service': '이용약관 동의',
  'privacy-policy': '개인정보 동의',
  'marketing-push-consent': '마케팅푸시 동의',
  'location-policy': '위치정보 동의',
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const doc = LEGAL_CONTENT[slug as LegalSlug]

  if (!doc) {
    notFound()
  }

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-y-auto py-11">
      <Header
        left={<LeftArrow />}
        center={
          <div className="text-[15px] font-medium text-[#000000]">{HEADER_TITLE[slug as LegalSlug]}</div>
        }
      />

      <div className="px-4">
        <LegalDocumentView doc={doc} />
      </div>
    </div>
  )
}
