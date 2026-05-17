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
  const { data, isPending, refetch, isError, error } = useQuery<
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
    isPending,
    check: refetch,
    isError,
  }
}
