import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { festivalDetailApi } from '@/api/facades/festival'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_BRAND_NAME } from '@/constants/site'
import { isApiErrorStatus } from '@/lib/utils/apiError'
import { toFestivalJsonLd, toFestivalSeoDescription } from '@/lib/utils/festivalSeo'
import { toJsonLdScript } from '@/lib/utils/spotSeo'
import { FestivalDetailClient } from './_components/FestivalDetailClient'

interface FestivalDetailPageProps {
  params: Promise<{ id: string }>
}

// 검색엔진·공유 크롤러가 받는 첫 HTML 에 본문이 담기도록 서버에서 먼저 조회한다 (스팟 상세와 같은 구조).
// generateMetadata 와 페이지가 한 요청 안에서 한 번만 조회하도록 cache 로 묶고, 공개 데이터라 5분 동안 재사용한다.
// 없는 축제면 null → 실제 404 (클라이언트 오류 화면으로 200 을 주면 soft 404 가 된다).
const getFestival = cache(async (rawId: string) => {
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) return null
  try {
    return await festivalDetailApi(id, { next: { revalidate: 300 } })
  } catch (error) {
    if (isApiErrorStatus(error, 404)) return null
    throw error
  }
})

// 빌드 때는 만들지 않고 첫 요청 때 생성해 5분간 재사용한다(ISR, 스팟 상세와 같은 구조).
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: FestivalDetailPageProps): Promise<Metadata> {
  const festival = await getFestival((await params).id)
  if (!festival) return {}

  const title = `${festival.name} 일정·장소`
  const description = toFestivalSeoDescription(festival)
  const path = `/festivals/${festival.festivalId}`
  // 대표 이미지는 CDN(cdn.peakda.com) 영구 URL 이라 공유 카드에 써도 깨지지 않는다.
  const image = festival.editorial?.heroImageUrl ?? DEFAULT_OG_IMAGE

  return {
    title: { absolute: `${title} | ${SITE_BRAND_NAME}` },
    description,
    alternates: { canonical: path },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_BRAND_NAME}`,
      description,
      images: [image],
    },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${title} | ${SITE_BRAND_NAME}`,
      description,
      url: path,
      images: [{ url: image, alt: festival.name }],
    },
  }
}

export default async function FestivalDetailPage({ params }: FestivalDetailPageProps) {
  const festival = await getFestival((await params).id)
  if (!festival) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(toFestivalJsonLd(festival)) }}
      />
      <FestivalDetailClient festival={festival} />
    </>
  )
}
