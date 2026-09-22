import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { festivalDetailApi } from '@/api/facades/festival'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_BRAND_NAME } from '@/constants/site'
import { isApiErrorStatus } from '@/lib/utils/apiError'
import { FESTIVAL_PHASE_LABEL, formatMonthDay } from '@/lib/utils/explore'
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

export async function generateMetadata({ params }: FestivalDetailPageProps): Promise<Metadata> {
  const festival = await getFestival((await params).id)
  if (!festival) return {}

  const title = `${festival.name} 일정·장소`
  const { startsOn, endsOn, phase } = festival
  const period = startsOn
    ? endsOn
      ? `${formatMonthDay(startsOn)}~${formatMonthDay(endsOn)}`
      : formatMonthDay(startsOn)
    : null
  // 기간 · 장소 · 진행 상태
  const description = [
    period,
    festival.roadAddress ?? festival.venue,
    phase ? FESTIVAL_PHASE_LABEL[phase] : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const path = `/festivals/${festival.festivalId}`
  // 대표 이미지는 CDN(cdn.peakda.com) 영구 URL 이라 공유 카드에 써도 깨지지 않는다.
  const image = festival.editorial?.heroImageUrl ?? DEFAULT_OG_IMAGE

  return {
    title,
    description,
    alternates: { canonical: path },
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

  return <FestivalDetailClient festival={festival} />
}
