import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { spotDetailApi } from '@/api/facades/spot'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_BRAND_NAME } from '@/constants/site'
import { isApiErrorStatus } from '@/lib/utils/apiError'
import {
  toJsonLdScript,
  toSpotJsonLd,
  toSpotSeoDescription,
  toSpotSeoTitle,
  toSpotShareImage,
} from '@/lib/utils/spotSeo'
import { SpotDetailClient } from './_components/SpotDetailClient'

interface SpotDetailPageProps {
  params: Promise<{ id: string }>
}

// 검색엔진·공유 크롤러가 받는 첫 HTML 에 본문이 담기도록 서버에서 먼저 조회한다.
// generateMetadata 와 페이지가 한 요청 안에서 한 번만 조회하도록 cache 로 묶고,
// 사용자 쿠키가 없는 비로그인 기준 응답이라 5분 동안 서버에서 재사용한다.
// 없는 스팟이면 null → 실제 404 (클라이언트 오류 화면으로 200 을 주면 soft 404 가 된다).
const getSpot = cache(async (rawId: string) => {
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) return null
  try {
    return await spotDetailApi(id, { next: { revalidate: 300 } })
  } catch (error) {
    if (isApiErrorStatus(error, 404)) return null
    throw error
  }
})

// generateStaticParams 가 없으면 fetch 가 캐시돼도 HTML 은 매 요청 서버에서 다시 그린다(ƒ).
// 빈 목록을 주면 빌드 때는 만들지 않고, 첫 요청 때 생성해 5분간 재사용한다(ISR). notFound() 도 404 로 캐시된다.
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: SpotDetailPageProps): Promise<Metadata> {
  const spot = await getSpot((await params).id)
  if (!spot) return {}

  const title =
    spot.bloom?.category === 'MAPLE'
      ? `${spot.name} ${spot.bloom.displayName} 절정 시기`
      : toSpotSeoTitle(spot)
  const description =
    toSpotSeoDescription(spot) || `${spot.name}의 위치와 방문 기록을 확인하고 여행을 준비하세요.`
  const path = `/spot/${spot.id}`
  const image = toSpotShareImage(spot)

  return {
    title: { absolute: `${title} | ${SITE_BRAND_NAME}` },
    description,
    alternates: { canonical: path },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_BRAND_NAME}`,
      description,
      images: [image ?? DEFAULT_OG_IMAGE],
    },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${title} | ${SITE_BRAND_NAME}`,
      description,
      url: path,
      images: [{ url: image ?? DEFAULT_OG_IMAGE, alt: spot.name }],
    },
  }
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const spot = await getSpot((await params).id)
  if (!spot) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(toSpotJsonLd(spot)) }}
      />
      <SpotDetailClient initialSpot={spot} />
    </>
  )
}
