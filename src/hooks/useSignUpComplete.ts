'use client'
import { completeSignupApi } from '@/api/facades/auth'
import { useQuery } from '@tanstack/react-query'

interface ApiError {
  response: {
    status: number
    data: { code: string; message: string }
  }
}

export const useSignUpComplete = (nickname: string, profileImageUrl: string | null) => {
  const { data, isPending, refetch, isError, error } = useQuery<
    Awaited<ReturnType<typeof completeSignupApi>>,
    ApiError
  >({
    queryKey: ['completeSignUp', nickname, profileImageUrl],
    queryFn: () => completeSignupApi({ nickname, profileImageUrl }),
    enabled: false,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

  return {
    message: data?.data.message ?? error?.response?.data?.message,
    isPending,
    check: refetch,
    isError,
  }
}
