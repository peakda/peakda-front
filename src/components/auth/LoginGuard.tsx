'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  AUTH_MARKER_CHANGED_EVENT,
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
      openLoginSheet(anchor.pathname === '/record' ? '기록을 남기려면 로그인이 필요해요.' : undefined)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [openLoginSheet])

  // 로그인 전에 받아 둔 보호 경로 prefetch 는 미들웨어의 /map?login=1 리다이렉트까지 캐시하고 있다.
  // 로그인이 클라이언트 이동(네이티브 로그인·가입 완료 등)으로 끝나면 그 캐시가 남아, 로그인 직후
  // + 버튼을 눌러도 로그인 시트로 돌아간다. 마커 값이 실제로 바뀔 때 라우터 캐시를 비운다.
  useEffect(() => {
    let prev = hasAuthMarker()
    const handleChange = () => {
      const next = hasAuthMarker()
      if (next === prev) return
      prev = next
      router.refresh()
    }

    window.addEventListener(AUTH_MARKER_CHANGED_EVENT, handleChange)
    return () => window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, handleChange)
  }, [router])

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
