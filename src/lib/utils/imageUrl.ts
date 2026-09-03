/**
 * API에서 내려오는 이미지 URL을 HTTPS 페이지에서도 표시할 수 있도록 정규화한다.
 * 상대 경로와 data/blob URL은 그대로 둔다.
 */
export function toHttpsImageUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url
}
