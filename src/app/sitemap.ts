import type { MetadataRoute } from 'next'
import { bloomMapApi } from '@/api/facades/seasonal-bloom'
import { SITE_URL } from '@/constants/site'
import { isSitemapSpotPin } from '@/lib/utils/spotSeo'

// 개화 추정은 하루 단위로 산출되므로 sitemap 도 하루에 한 번 다시 만든다.
export const revalidate = 86400

// 제주(마라도)~독도를 모두 덮는 범위. 스팟 목록 API 가 따로 없어 개화 지도를 한 번에 조회해 spotId 를 모은다.
const KOREA_BBOX = { minLat: 33, maxLat: 38.7, minLng: 124.5, maxLng: 131.9 }

// 공개·정상 응답하는 canonical URL 만 넣는다. 축제·큐레이션은 조회 API 가 아직 인증을 요구해 제외.
const STATIC_PATHS = ['', '/map', '/explore', '/feed']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'daily',
  }))

  try {
    const bloomMap = await bloomMapApi(KOREA_BBOX)
    const lastModified = bloomMap?.baseDate ?? undefined
    // 동네 스팟·오분류 의심 명소는 검색 노출 대상에서 뺀다 (기준은 isSitemapSpotPin).
    const spotPages: MetadataRoute.Sitemap = (bloomMap?.pins ?? [])
      .filter(isSitemapSpotPin)
      .map((pin) => ({
        url: `${SITE_URL}/spot/${pin.spotId}`,
        lastModified,
        changeFrequency: 'daily',
      }))
    return [...staticPages, ...spotPages]
  } catch (error) {
    // 백엔드 장애로 sitemap 전체가 500 이 되면 고정 페이지까지 제출되지 않는다. 고정 페이지만이라도 낸다.
    console.error('sitemap 스팟 목록 조회 실패', error)
    return staticPages
  }
}
