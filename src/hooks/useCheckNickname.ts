'use client'
import { useQuery } from '@tanstack/react-query'
import { checkNicknameApi } from '@/api/facades/auth'

interface ApiError {
  response: {
    status: number
    data: { code: string; message: string }
  }
}

export const useCheckNickname = (nickname: string) => {
  const { data, isFetching, refetch, isError, error } = useQuery<
    Awaited<ReturnType<typeof checkNicknameApi>>,
    ApiError
  >({
    queryKey: ['checkNickname', nickname],
    queryFn: () => checkNicknameApi(nickname),
    enabled: false,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

  return {
    isAvailable: data?.data?.available,
    message: data?.message ?? error?.response?.data?.message,
    // enabled:false 쿼리는 첫 fetch 전까지 status 가 'pending' 이라 isPending 이 계속 true 다.
    // 그대로 내보내면 중복확인 버튼이 영구 disabled 되어 refetch 자체를 못 한다.
    // 실제 요청이 도는 동안만 잠기도록 isFetching 을 쓴다.
    isPending: isFetching,
    check: refetch,
    isError,
  }
}
