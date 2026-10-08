import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_MARKER, LOGIN_SHEET_QUERY, RETURN_TO, isProtectedPath } from '@/lib/auth/session'
import { toExploreSection } from '@/lib/utils/explore'

// 인증 쿠키는 백엔드(AWS) 도메인에 SameSite=None 으로 심겨 프런트(Vercel)로 오지 않는다.
// 그래서 미들웨어는 프런트 도메인에 따로 심는 마커 쿠키만 보고 라우팅한다.
// 보안 경계가 아니라 UX 라우팅용이며, 실제 인증 검증은 백엔드가 401 로 한다.

// 마커가 있으면 /map 으로 보내는 진입 화면들 (/auth/callback 은 제외 — 콜백이 스스로 분기해야 한다)
const ENTRY_PATHS = ['/', '/onboarding', '/login']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // landing.peakda.com 은 같은 Vercel 프로젝트에 붙인 서브도메인이다. 루트만 랜딩 페이지로 rewrite 하고,
  // 로그인 마커로 /map 에 보내는 아래 진입 화면 처리보다 먼저 둔다.
  // 호스트는 Host 헤더로 본다 — next dev 에서는 nextUrl.hostname 이 Host 와 무관하게 localhost 로 나온다.
  if (request.headers.get('host')?.startsWith('landing.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/landing', request.url))
  }

  // 탐색 전체 목록(/explore/spots?section=X)은 섹션별 정적 페이지로 rewrite 한다 — 쿼리를 페이지에서 읽으면
  // 매 요청 서버 렌더링이 된다(app/explore/spots/[section]/page.tsx 참고). 로그인 여부와 무관해 맨 먼저 처리한다.
  if (pathname === '/explore/spots') {
    const section = toExploreSection(request.nextUrl.searchParams.get('section') ?? undefined)
    return NextResponse.rewrite(new URL(`/explore/spots/${section}`, request.url))
  }

  const hasMarker = request.cookies.get(AUTH_MARKER)?.value === '1'

  if (hasMarker) {
    if (ENTRY_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL('/map', request.url))
    }
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) return NextResponse.next()

  // 로그인 페이지로 보내지 않는다. 앱 안의 링크는 LoginGuard 가 이동 전에 막으므로
  // 여기 오는 건 주소 직접 입력·새로고침·외부 링크다. 지도를 띄우고 그 위에 로그인 바텀시트를 연다.
  // 로그인 후 원래 가려던 곳으로 돌아가도록 현재 위치를 one-shot 쿠키로 남긴다.
  const response = NextResponse.redirect(new URL(`/map?${LOGIN_SHEET_QUERY}=1`, request.url))
  response.cookies.set(RETURN_TO, `${pathname}${search}`, {
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  // _next 내부 자원, 정적 파일(확장자 있는 경로), public 하위 아이콘/이미지는 미들웨어를 태우지 않는다.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.[\\w]+$).*)'],
}
