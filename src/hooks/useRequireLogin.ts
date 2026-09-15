import { useCallback } from 'react'
import { setReturnTo } from '@/lib/auth/session'
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

// 로그인이 필요한 버튼(찜·반응·팔로우 등)용. 비로그인이면 action 대신 로그인 바텀시트를 열고,
// 소셜 로그인 후 /auth/callback 이 지금 화면으로 돌려보내도록 위치를 남긴다.
export function useRequireLogin() {
  const isLoggedIn = useIsLoggedIn()
  const openLoginSheet = useLoginSheetStore((s) => s.openLoginSheet)

  return useCallback(
    (action: () => void, message?: string) => {
      if (isLoggedIn) {
        action()
        return
      }
      setReturnTo(`${window.location.pathname}${window.location.search}`)
      openLoginSheet(message)
    },
    [isLoggedIn, openLoginSheet]
  )
}
