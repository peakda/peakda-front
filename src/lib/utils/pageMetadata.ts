import type { Metadata } from 'next'
import { BASE_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_BRAND_NAME } from '@/constants/site'

// 검색·공유 metadata 전용. null은 쿼리별 목록에서 부모 canonical 상속을 해제한다.
export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string | null
}): Metadata {
  const fullTitle = `${title} | ${SITE_BRAND_NAME}`
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: fullTitle,
      description,
      ...(path ? { url: path } : {}),
      images: [{ url: DEFAULT_OG_IMAGE, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}
