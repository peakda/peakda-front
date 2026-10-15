import { useSyncExternalStore } from 'react'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { SITE_URL } from '@/constants/site'
import { createRequestQueue } from '@/lib/utils/requestQueue'
import {
  parseInstagramEmbed,
  parseOgMeta,
  toInstagramEmbedUrl,
  toNaverBlogMobileUrl,
  type ContentLinkMeta,
} from '@/lib/utils/contentLinkMeta'
import type { ContentLinkPlatform } from '@/api/facades/generated/peakdaApi.schemas'

interface YoutubeOembedResponse {
  title?: unknown
}

// 미리보기 메타데이터는 서버가 주지 않아 클라이언트가 직접 조회한다. 백엔드 API 가 아니라
// customInstance(백엔드 주소·인증 쿠키 전용)를 거치지 않는다.
// - YouTube: oEmbed 가 CORS 를 열어 웹·앱 모두 조회한다.
// - 네이버 블로그·인스타그램: CORS 헤더가 없어 브라우저에서는 못 받는다. 앱에서만 네이티브 HTTP 로
//   원문 HTML 을 받아 파싱하고, 웹은 플랫폼명 + URL 만 보여 준다.
async function fetchYoutubeTitle(
  url: string,
  signal?: AbortSignal
): Promise<ContentLinkMeta | null> {
  const res = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    { signal }
  )
  if (!res.ok) return null
  const body: YoutubeOembedResponse = await res.json()
  return typeof body.title === 'string' && body.title ? { title: body.title } : null
}

// 브라우저 UA 로 요청하면 인스타그램이 OG·본문 없는 JS 껍데기만 준다(2026-10-12 확인).
// 앱 자체 UA 로 보내면 블로그·인스타 모두 HTML 에 값이 들어온다.
const PREVIEW_HEADERS = {
  'User-Agent': `PeakdaLinkPreview/1.0 (+${SITE_URL})`,
  'Accept-Language': 'ko-KR,ko;q=0.9',
}
const PREVIEW_TIMEOUT_MS = 5000
const enqueuePreview = createRequestQueue(3)

// capacitor.config 의 CapacitorHttp 전역 패치(fetch 가로채기)는 꺼 둔 채 플러그인을 직접 부른다.
// 켜면 백엔드 호출까지 네이티브로 바뀌어 쿠키 인증 흐름이 달라진다.
async function fetchHtmlNative(url: string): Promise<string | null> {
  const res = await CapacitorHttp.get({
    url,
    headers: PREVIEW_HEADERS,
    connectTimeout: PREVIEW_TIMEOUT_MS,
    readTimeout: PREVIEW_TIMEOUT_MS,
    responseType: 'text',
  })
  if (res.status < 200 || res.status >= 300 || typeof res.data !== 'string') return null
  return res.data
}

async function fetchContentLinkMeta(
  url: string,
  platform: ContentLinkPlatform,
  signal?: AbortSignal
): Promise<ContentLinkMeta | null> {
  if (platform === 'YOUTUBE') return fetchYoutubeTitle(url, signal)
  if (platform === 'NAVER_BLOG') {
    const html = await fetchHtmlNative(toNaverBlogMobileUrl(url))
    return html ? parseOgMeta(html) : null
  }
  if (platform === 'INSTAGRAM') {
    const embedUrl = toInstagramEmbedUrl(url)
    const html = embedUrl ? await fetchHtmlNative(embedUrl) : null
    return html ? parseInstagramEmbed(html) : null
  }
  return null
}

const noopSubscribe = () => () => {}

// 서버 렌더와 첫 하이드레이션은 false 로 맞추고, 그 뒤에 실제 값으로 바뀐다(불일치 방지).
const useIsNativeApp = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => Capacitor.isNativePlatform(),
    () => false
  )

// 조회에 실패해도(비공개·로그인월·타임아웃) 카드는 플랫폼명 + URL 로 그려지므로 재시도하지 않는다.
// 같은 URL 은 캐시에 남아 있는 동안 재사용하고, 구독이 없어진 뒤 30분 후 정리한다.
// 입력창에서 한 글자씩 칠 때마다 부르지 않도록 URL 이 멈췄을 때만 조회한다. 첫 렌더는 바로 조회한다.
export function useContentLinkMeta(url: string, platform: ContentLinkPlatform, enabled = true) {
  const isNativeApp = useIsNativeApp()
  const debouncedUrl = useDebounce(url)
  const canFetch =
    platform === 'YOUTUBE' ||
    (isNativeApp && (platform === 'NAVER_BLOG' || platform === 'INSTAGRAM'))
  // URL 이 바뀌면 디바운스가 끝나기 전이라도 이전 URL 의 미리보기는 바로 지운다.
  const isSettled = debouncedUrl === url
  const query = useQuery({
    queryKey: ['content-link-meta', url, platform],
    queryFn: ({ signal }) =>
      enqueuePreview(() => fetchContentLinkMeta(url, platform, signal), signal),
    enabled: enabled && canFetch && isSettled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })
  return {
    meta: canFetch && isSettled ? (query.data ?? null) : null,
    isLoading: enabled && canFetch && (!isSettled || query.isLoading),
  }
}
