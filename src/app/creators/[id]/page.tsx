import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { curationDetailApi } from '@/api/facades/curation'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_BRAND_NAME } from '@/constants/site'
import { isApiErrorStatus } from '@/lib/utils/apiError'
import { CreatorDetailClient } from './_components/CreatorDetailClient'

interface CreatorDetailPageProps {
  params: Promise<{ id: string }>
}

// 검색엔진·공유 크롤러가 받는 첫 HTML 에 본문이 담기도록 서버에서 먼저 조회한다 (스팟 상세와 같은 구조).
// generateMetadata 와 페이지가 한 요청 안에서 한 번만 조회하도록 cache 로 묶고, 공개 데이터라 5분 동안 재사용한다.
// 없는(또는 발행 전) 큐레이션이면 null → 실제 404.
const getCuration = cache(async (rawId: string) => {
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) return null
  try {
    return await curationDetailApi(id, { next: { revalidate: 300 } })
  } catch (error) {
    if (isApiErrorStatus(error, 404)) return null
    throw error
  }
})

export async function generateMetadata({ params }: CreatorDetailPageProps): Promise<Metadata> {
  const curation = await getCuration((await params).id)
  if (!curation) return {}

  // 제목은 화면에서 whitespace-pre-line 으로 줄바꿈되므로 metadata 에서는 한 줄로 편다.
  const title = curation.title.replace(/\s*\n\s*/g, ' ')
  // 부제 · 주차 라벨
  const description = [curation.subtitle, curation.weekLabel].filter(Boolean).join(' · ')
  const path = `/creators/${curation.id}`
  // 대표 이미지는 CDN(cdn.peakda.com) 영구 URL 이라 공유 카드에 써도 깨지지 않는다.
  const image = curation.heroImageUrl ?? DEFAULT_OG_IMAGE

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${title} | ${SITE_BRAND_NAME}`,
      description,
      url: path,
      images: [{ url: image, alt: title }],
    },
  }
}

export default async function CreatorDetailPage({ params }: CreatorDetailPageProps) {
  const curation = await getCuration((await params).id)
  if (!curation) notFound()

  return <CreatorDetailClient curation={curation} />
}
