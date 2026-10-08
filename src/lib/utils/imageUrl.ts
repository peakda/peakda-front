/**
 * API에서 내려오는 이미지 URL을 HTTPS 페이지에서도 표시할 수 있도록 정규화한다.
 * 상대 경로와 data/blob URL은 그대로 둔다.
 */
export function toHttpsImageUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url
}

/**
 * 카카오 프로필 사진(640px)을 같은 주소의 110px 판으로 바꾼다. 32~40px 아바타가 원본(약 85KB)을 받지 않게 하려는 것으로,
 * 110px 판은 약 7KB 다. 실패하면 원본으로 되돌리는 건 그리는 쪽(AvatarImage)이 맡는다. 카카오가 아닌 주소는 그대로 둔다.
 * - 사용자 사진: k.kakaocdn.net/dn/…/img_640x640.jpg → img_110x110.jpg
 * - 기본 프로필: img1.kakaocdn.net/thumb/R640x640.q70/?fname=… → R110x110.q70
 */
export function toSmallAvatarUrl(url: string): string {
  if (!/^https?:\/\/[^/]+\.kakaocdn\.net\//.test(url)) return url
  return url
    .replace(/\/img_640x640\.jpg(?=$|\?)/, '/img_110x110.jpg')
    .replace('/thumb/R640x640.', '/thumb/R110x110.')
}
