// 기록의 관련 콘텐츠 링크 (PEAK-134, 서버 PR #166/#167).
// 생성(POST) contentLinkUrl: null/'' = 링크 없음. 임시저장을 덮어쓸 때 빠지면 링크가 지워지므로 항상 보낸다.
// 수정(PATCH) contentLinkUrl: 빠지면 유지, '' = 삭제, 새 URL = 교체.
import type { ContentLinkPlatform } from '@/api/facades/generated/peakdaApi.schemas'

// 서버가 링크 검증에 실패하면 400 과 함께 내려주는 에러 코드
export const INVALID_CONTENT_LINK_CODE = 'SPOT_RECORD_INVALID_CONTENT_LINK'

export const CONTENT_LINK_MAX_LENGTH = 2048

export const CONTENT_LINK_PLATFORM_LABEL: Record<
  Exclude<ContentLinkPlatform, 'UNSUPPORTED'>,
  string
> = {
  INSTAGRAM: 'Instagram',
  NAVER_BLOG: 'Naver Blog',
  YOUTUBE: 'YouTube',
}

const SCHEME = /^([a-z][a-z0-9+.-]*):/i

// 서버 정규화를 따라 한다 — 앞뒤 공백 제거, 스킴이 없으면 https:// 를 붙인다.
// 서버가 400 으로 거절할 주소(http/https 가 아님, instagram.com@다른도메인 처럼 userinfo 가 낀 주소,
// 2048자 초과)는 null 을 돌려 게시 전에 막는다. 빈 입력도 null 이다.
export function normalizeContentLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const scheme = SCHEME.exec(trimmed)?.[1].toLowerCase()
  // 'instagram.com:443/…' 처럼 스킴처럼 보이는 호스트도 https:// 를 붙여 URL 로 해석한다.
  // 'javascript:…'·'mailto:…' 는 붙여도 호스트/포트가 깨지거나 userinfo 가 생겨 아래에서 걸러진다.
  const withScheme = scheme === 'http' || scheme === 'https' ? trimmed : `https://${trimmed}`
  if (withScheme.length > CONTENT_LINK_MAX_LENGTH) return null

  let parsed: URL
  try {
    parsed = new URL(withScheme)
  } catch {
    return null
  }
  if (parsed.username || parsed.password) return null
  if (!parsed.hostname.includes('.')) return null
  return withScheme
}

const isHostOf = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`)

// 서버와 같은 hostname 기준(서브도메인 포함) 분류. 응답의 platform 이 오기 전(입력 중)에 쓴다.
export function classifyContentLink(url: string): ContentLinkPlatform {
  const hostname = new URL(url).hostname.toLowerCase()
  if (isHostOf(hostname, 'instagram.com')) return 'INSTAGRAM'
  if (isHostOf(hostname, 'blog.naver.com')) return 'NAVER_BLOG'
  if (isHostOf(hostname, 'youtube.com') || isHostOf(hostname, 'youtu.be')) return 'YOUTUBE'
  return 'UNSUPPORTED'
}

// 카드 하단 원문 URL 표기 — 디자인처럼 스킴과 www. 를 뗀다.
export function toDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
}
