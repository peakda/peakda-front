import type { MetadataRoute } from 'next'
import { bloomMapApi } from '@/api/facades/seasonal-bloom'
import { sitemapApi, type SitemapResponse } from '@/api/facades/sitemap'
import { SITE_URL } from '@/constants/site'
import { isSitemapSpotPin } from '@/lib/utils/spotSeo'

// 개화 추정은 하루 단위로 산출되므로 sitemap 도 하루에 한 번 다시 만든다. (/api/sitemap 도 하루 1회 호출 전제)
export const revalidate = 86400

// 제주(마라도)~독도를 모두 덮는 범위. 개화 지도를 한 번에 조회해 sitemap 에 넣을 spotId 를 고른다.
const KOREA_BBOX = { minLat: 33, maxLat: 38.7, minLng: 124.5, maxLng: 131.9 }

// 공개·정상 응답하는 canonical URL 만 넣는다. /explore/spots 는 ?section 마다 목록이 달라 canonical 이 없어 제외.
const STATIC_PATHS = ['', '/map', '/explore', '/explore/festivals', '/feed']

// 조회마다 따로 실패를 삼킨다 — 백엔드 장애로 sitemap 전체가 500 이 되면 고정 페이지까지 제출되지 않는다.

async function getSitemapIndex(): Promise<SitemapResponse | null> {
  try {
    return await sitemapApi()
  } catch (error) {
    console.error('sitemap 목록 조회 실패', error)
    return null
  }
}

// /api/sitemap 의 스팟(1만여 곳)은 개화 정보·기록이 없는 관광지가 대부분이라, 목록은 개화 지도 핀에서 고르고
// 수정 시각만 가져온다. 매일 바뀌는 개화 기준일은 lastModified 로 쓰지 않는다 — 모든 주소가 매일 바뀐 것처럼 보인다.
async function getSpotIds(): Promise<number[]> {
  try {
    const bloomMap = await bloomMapApi(KOREA_BBOX)
    // 동네 스팟·오분류 의심 명소는 검색 노출 대상에서 뺀다 (기준은 isSitemapSpotPin — spotId 가 있는 핀만 통과).
    return (bloomMap?.pins ?? []).filter(isSitemapSpotPin).flatMap((pin) => pin.spotId ?? [])
  } catch (error) {
    console.error('sitemap 스팟 목록 조회 실패', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'daily',
  }))
  // API 주소가 없는 환경(Vercel Preview 등)에서 상대 URL 로 조회하면 에러를 잡아도 빌드 워커가 끝나지 않는다.
  if (!process.env.NEXT_PUBLIC_API_URL) return staticPages

  const [index, spotIds] = await Promise.all([getSitemapIndex(), getSpotIds()])
  const spotUpdatedAt = new Map((index?.spots ?? []).map((spot) => [spot.id, spot.updatedAt]))
  const spotPages: MetadataRoute.Sitemap = spotIds.map((id) => ({
    url: `${SITE_URL}/spot/${id}`,
    lastModified: spotUpdatedAt.get(id),
    changeFrequency: 'daily',
  }))
  // 축제는 끝났거나 시작 전인 것까지 전체가 온다.
  const festivalPages: MetadataRoute.Sitemap = (index?.festivals ?? []).map((festival) => ({
    url: `${SITE_URL}/festivals/${festival.id}`,
    lastModified: festival.updatedAt,
    changeFrequency: 'daily',
  }))
  const curationPages: MetadataRoute.Sitemap = (index?.curations ?? []).map((curation) => ({
    url: `${SITE_URL}/creators/${curation.id}`,
    lastModified: curation.updatedAt,
    changeFrequency: 'weekly',
  }))
  return [...staticPages, ...spotPages, ...festivalPages, ...curationPages]
}
