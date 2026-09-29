import { useSyncExternalStore } from 'react'
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'

// 전역 쿼리 기본 staleTime (src/app/_components/Providers.tsx)
export const DEFAULT_STALE_TIME = 1000 * 60 * 5

const noopSubscribe = () => () => {}

/**
 * 서버에서 받은 초기값(initialData)으로 시작하는 쿼리의 enabled·staleTime.
 *
 * 서버 HTML 은 비로그인 기준이라 찜·알림·내 리액션 상태가 비어 있다. 로그인 사용자는 초기값을
 * 곧바로 stale 로 보고 한 번 다시 받고, 그 뒤엔 전역 staleTime 을 따른다(마운트·포커스마다 재요청하지 않는다).
 *
 * enabled 를 하이드레이션 동안 끄는 이유: 하이드레이션 첫 렌더에서 useIsLoggedIn 은 false 라
 * 쿼리가 fresh 로 구독되고, 이후 로그인 값이 true 로 바뀌어 staleTime 만 달라져도 TanStack 은 재요청하지 않는다
 * (키 변경이나 enabled false→true 일 때만 다시 판정한다). 그래서 새로고침·직접 진입 시 SSR 값이 그대로 남았다.
 *
 * isInitial 은 캐시의 데이터가 아직 서버 초기값 그대로인지 판정한다(참조 비교).
 */
export function useSsrInitialQuery<TData>(isInitial: (data: TData | undefined) => boolean) {
  const isLoggedIn = useIsLoggedIn()
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)

  return {
    enabled: isHydrated,
    staleTime: (query: { state: { data: TData | undefined } }) =>
      isLoggedIn && isInitial(query.state.data) ? 0 : DEFAULT_STALE_TIME,
  }
}
