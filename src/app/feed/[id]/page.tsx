import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { feedDetailApi } from '@/api/facades/feed'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE } from '@/constants/site'
import { isApiErrorStatus } from '@/lib/utils/apiError'
import { FeedDetailClient } from './_components/FeedDetailClient'

interface FeedDetailPageProps {
  params: Promise<{ id: string }>
}

const DESCRIPTION_MAX_LENGTH = 120

// 페이지별 metadata 와 실제 404 만 서버에서 처리한다. 본문은 기존대로 클라이언트가 그린다.
// generateMetadata 와 페이지가 한 요청 안에서 한 번만 조회하도록 cache 로 묶는다.
const getRecord = cache(async (rawId: string) => {
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) return null
  try {
    return await feedDetailApi(id, { next: { revalidate: 60 } })
  } catch (error) {
    if (isApiErrorStatus(error, 404)) return null
    throw error
  }
})

export async function generateMetadata({ params }: FeedDetailPageProps): Promise<Metadata> {
  const record = await getRecord((await params).id)
  if (!record) return {}

  const title = `${record.spot.name} 방문 기록`
  const memo = record.memo?.trim()
  const description = memo
    ? memo.length > DESCRIPTION_MAX_LENGTH
      ? `${memo.slice(0, DESCRIPTION_MAX_LENGTH - 1)}…`
      : memo
    : `${record.user.nickname}님이 남긴 ${record.spot.name} 방문 기록이에요.`
  const path = `/feed/${record.id}`

  return {
    title,
    description,
    alternates: { canonical: path },
    // 기록 사진은 만료되는 presigned URL 이라 공유 카드에 쓰면 나중에 깨진다.
    // 기본 카드를 쓴다 (영구 URL 은 백엔드 요청 대기).
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${title} | Peakda`,
      description,
      url: path,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
  const record = await getRecord((await params).id)
  if (!record) notFound()

  return <FeedDetailClient />
}
