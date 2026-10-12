// 관련 콘텐츠 링크 미리보기 메타데이터 파싱. 원문 HTML 은 앱(Capacitor)에서만 네이티브 HTTP 로 받는다
// (useContentLinkMeta). 여기는 받은 HTML 에서 값을 뽑는 순수 함수만 둔다.
// DOMParser 문서는 스크립트를 실행하지 않고 이미지 등 리소스도 받지 않는다.

export interface ContentLinkMeta {
  // Instagram: @계정 · 블로그: 글 제목 · YouTube: 영상 제목
  title: string
  // Instagram: 게시물 본문 · 블로그: 글 요약
  description?: string
}

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html')

// 줄바꿈·연속 공백을 한 칸으로 — 카드에서 한 줄 말줄임으로 보여 준다.
const collapse = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim() ?? ''

const metaContent = (doc: Document, property: string) =>
  collapse(doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content'))

// blog.naver.com 은 본문을 iframe 으로 감싼 껍데기라 OG 태그가 없다. 모바일 주소는 바로 OG 를 준다.
// 경로·쿼리는 그대로 쓴다 (/{blogId}/{logNo}, /PostView.naver?blogId=…&logNo=… 모두 확인).
export function toNaverBlogMobileUrl(url: string): string {
  const parsed = new URL(url)
  parsed.hostname = 'm.blog.naver.com'
  parsed.protocol = 'https:'
  return parsed.toString()
}

// 인스타그램 게시물 페이지는 og:title·og:description 을 주지 않는다. 공개 임베드 페이지에는
// 계정명과 본문이 들어 있어 그쪽을 받는다. /{계정}/p/{코드} 형식과 릴스도 같은 코드로 열린다.
// 게시물이 아닌 주소(프로필 등)는 null — 플랫폼명과 URL 만 보여 준다.
export function toInstagramEmbedUrl(url: string): string | null {
  const code = /\/(?:p|reels?|tv)\/([A-Za-z0-9_-]+)/.exec(new URL(url).pathname)?.[1]
  return code ? `https://www.instagram.com/p/${code}/embed/captioned/` : null
}

export function parseInstagramEmbed(html: string): ContentLinkMeta | null {
  const doc = parseHtml(html)
  const username =
    collapse(doc.querySelector('.CaptionUsername')?.textContent) ||
    collapse(doc.querySelector('.UsernameText')?.textContent)
  // 비공개·삭제된 게시물은 계정명 없이 안내 문구만 온다.
  if (!username) return null

  const caption = doc.querySelector('.Caption')
  if (caption) {
    caption.querySelector('.CaptionUsername')?.remove()
    caption.querySelector('.CaptionComments')?.remove()
    caption.querySelectorAll('br').forEach((br) => br.replaceWith(' '))
  }
  const description = collapse(caption?.textContent)
  return { title: `@${username}`, description: description || undefined }
}

// 블로그 등 일반 페이지의 og:title·og:description. 제목이 없으면 null.
export function parseOgMeta(html: string): ContentLinkMeta | null {
  const doc = parseHtml(html)
  // 블로그 홈 주소는 제목 뒤에 ' : 네이버 블로그' 가 붙는다(글 주소는 안 붙는다).
  const title = metaContent(doc, 'og:title').replace(/\s*:\s*네이버 블로그$/, '')
  if (!title) return null
  const description = metaContent(doc, 'og:description')
  return { title, description: description || undefined }
}
