'use client'
import { useCompleteSignup } from '@/api/facades/auth'
import type { SignupCompleteRequestFavoriteCategoriesItem } from '@/api/facades/generated/peakdaApi.schemas'

interface ApiError {
  response: {
    status: number
    data: { code: string; message: string }
  }
}

export const useSignUpComplete = (
  nickname: string,
  profileImageUrl: string | null,
  favoriteCategories: SignupCompleteRequestFavoriteCategoriesItem[],
  options?: { onSuccess?: () => void }
) => {
  const { mutate, data, isPending, isError, error } = useCompleteSignup()

  const submit = () =>
    mutate({ data: { nickname, profileImageUrl, favoriteCategories } }, { onSuccess: options?.onSuccess })

  return {
    message: data?.data.message ?? (error as ApiError | null)?.response?.data?.message,
    isPending,
    check: submit,
    isError,
  }
}
