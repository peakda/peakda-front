import LeftArrow from '@/components/ui/LeftArrow'
import Header from '@/components/ui/Header'

interface PageProps {
  params: Promise<{ slug: string }>
}
const TERMS_MAP: Record<string, { slug: string; content: string }> = {
  'terms-of-service': {
    slug: '이용약관 동의',
    content: `sadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsd`,
  },
  'privacy-policy': {
    slug: '개인정보 동의',
    content:
      'sadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsd',
  },
  'marketing-push-consent': {
    slug: '마케팅푸시 동의',
    content:
      'sadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsdsadsadsadsadsadsaddsd',
  },
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="relative flex h-dvh w-full flex-col py-11">
      <Header
        left={<LeftArrow />}
        center={
          <div className="text-[15px] font-medium text-[#000000]">{TERMS_MAP[slug].slug}</div>
        }
      />

      <div className="px-4">
        <p className="leading-7 wrap-break-word whitespace-pre-wrap">{TERMS_MAP[slug].content}</p>
      </div>
    </div>
  )
}
