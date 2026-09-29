import type { MetadataRoute } from 'next'
import { bloomMapApi } from '@/api/facades/seasonal-bloom'
import { exploreFestivalsApi } from '@/api/facades/explore-festivals'
import { curationListApi } from '@/api/facades/curation'
import { SITE_URL } from '@/constants/site'
import { isSitemapSpotPin } from '@/lib/utils/spotSeo'

// 개화 추정은 하루 단위로 산출되므로 sitemap 도 하루에 한 번 다시 만든다.
export const revalidate = 86400

// 제주(마라도)~독도를 모두 덮는 범위. 스팟 목록 API 가 따로 없어 개화 지도를 한 번에 조회해 spotId 를 모은다.
const KOREA_BBOX = { minLat: 33, maxLat: 38.7, minLng: 124.5, maxLng: 131.9 }

// 공개·정상 응답하는 canonical URL 만 넣는다. /explore/spots 는 ?section 마다 목록이 달라 canonical 이 없어 제외.
const STATIC_PATHS = ['', '/map', '/explore', '/explore/festivals', '/feed']

// 큐레이션은 주 1개씩 발행된다. 서버 최대 size(50)면 1년 가까이 한 페이지로 충분하다.
const CURATION_PAGE_SIZE = 50

// 목록마다 따로 실패를 삼킨다 — 백엔드 장애로 sitemap 전체가 500 이 되면 고정 페이지까지 제출되지 않는다.

async function getSpotPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const bloomMap = await bloomMapApi(KOREA_BBOX)
    const lastModified = bloomMap?.baseDate ?? undefined
    // 동네 스팟·오분류 의심 명소는 검색 노출 대상에서 뺀다 (기준은 isSitemapSpotPin).
    return (bloomMap?.pins ?? []).filter(isSitemapSpotPin).map((pin) => ({
      url: `${SITE_URL}/spot/${pin.spotId}`,
      lastModified,
      changeFrequency: 'daily',
    }))
  } catch (error) {
    console.error('sitemap 스팟 목록 조회 실패', error)
    return []
  }
}

// 공개 목록 API 가 진행 중 축제만 준다. 끝났거나 시작 전인 축제 상세는 sitemap 에서 빠진다.
async function getFestivalPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const festivals = await exploreFestivalsApi()
    return (festivals?.items ?? []).map((item) => ({
      url: `${SITE_URL}/festivals/${item.festivalId}`,
      changeFrequency: 'daily',
    }))
  } catch (error) {
    console.error('sitemap 축제 목록 조회 실패', error)
    return []
  }
}

async function getCurationPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const curations = await curationListApi({
      pageRequest: { page: 0, size: CURATION_PAGE_SIZE },
    })
    return (curations?.content ?? []).map((item) => ({
      url: `${SITE_URL}/creators/${item.id}`,
      changeFrequency: 'weekly',
    }))
  } catch (error) {
    console.error('sitemap 큐레이션 목록 조회 실패', error)
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

  const [spotPages, festivalPages, curationPages] = await Promise.all([
    getSpotPages(),
    getFestivalPages(),
    getCurationPages(),
  ])
  return [...staticPages, ...spotPages, ...festivalPages, ...curationPages]
}
