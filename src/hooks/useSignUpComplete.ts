'use client'
import { useCompleteSignup } from '@/api/facades/auth'
import type { SignupCompleteRequestFavoriteCategoriesItem } from '@/api/facades/generated/peakdaApi.schemas'
import { getApiErrorMessage } from '@/lib/utils/apiError'

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
    message: data?.data.message ?? getApiErrorMessage(error),
    isPending,
    check: submit,
    isError,
  }
}
