import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_MARKER, LOGIN_SHEET_QUERY, RETURN_TO, isProtectedPath } from '@/lib/auth/session'

// 인증 쿠키는 백엔드(AWS) 도메인에 SameSite=None 으로 심겨 프런트(Vercel)로 오지 않는다.
// 그래서 미들웨어는 프런트 도메인에 따로 심는 마커 쿠키만 보고 라우팅한다.
// 보안 경계가 아니라 UX 라우팅용이며, 실제 인증 검증은 백엔드가 401 로 한다.

// 마커가 있으면 /map 으로 보내는 진입 화면들 (/auth/callback 은 제외 — 콜백이 스스로 분기해야 한다)
const ENTRY_PATHS = ['/', '/onboarding', '/login']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
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
