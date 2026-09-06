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

  const available = data?.data?.available
  // 중복이든 아니든 응답은 항상 200 / code:'SUCCESS' / message:'OK' 다. message 는 요청이
  // 성공했다는 래퍼 문구일 뿐 안내 문구가 아니라서, 그대로 노출하면 중복일 때 에러 자리에
  // 'OK' 가 찍힌다. 중복 판정은 data.available 로만 하고 문구는 프런트에서 만든다.
  const isDuplicated = available === false

  return {
    isAvailable: available,
    message: isDuplicated ? '이미 사용 중인 닉네임이에요.' : error?.response?.data?.message,
    // 요청이 실제로 도는 동안에만 버튼을 잠근다.
    isPending: isFetching,
    check: refetch,
    isError: isError || isDuplicated,
  }
}
