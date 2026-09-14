'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LOGIN_SHEET_QUERY,
  hasAuthMarker,
  isProtectedPath,
  setReturnTo,
} from '@/lib/auth/session'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

// 비로그인 사용자를 로그인 페이지로 보내지 않고 바텀시트로 막는 로직. 화면(LoginSheet)과 분리해 둬서
// 시트 디자인을 바꿔도 이 파일은 그대로 둔다. 버튼 단위 막기는 useRequireLogin 이 맡는다.
export function LoginGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const openLoginSheet = useLoginSheetStore((s) => s.openLoginSheet)

  // 막힌 경로로 가는 <a>/<Link> 클릭을 이동 전에 가로챈다. 링크마다 막으면 빠뜨리기 쉬워
  // 캡처 단계에서 한 번에 처리한다 — Next Link 는 defaultPrevented 면 이동하지 않는다.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return
      if (hasAuthMarker()) return

      const anchor = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement) || anchor.origin !== window.location.origin) return
      if (!isProtectedPath(anchor.pathname)) return

      e.preventDefault()
      setReturnTo(`${anchor.pathname}${anchor.search}`)
      openLoginSheet()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [openLoginSheet])

  // 미들웨어가 막힌 경로를 /map?login=1 로 보낸 경우. 시트를 열고 새로고침 때 또 뜨지 않게 쿼리를 지운다.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get(LOGIN_SHEET_QUERY) !== '1') return

    url.searchParams.delete(LOGIN_SHEET_QUERY)
    router.replace(`${url.pathname}${url.search}`)
    openLoginSheet()
  }, [pathname, router, openLoginSheet])

  return null
}
