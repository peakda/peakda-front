import { useQueryClient } from '@tanstack/react-query'
import {
  getAuthSignupNicknameCheck,
  postAuthSignupComplete,
  getAuthMe,
  getGetAuthMeQueryKey,
  postAuthLogout,
  postAuthRefresh,
  postAuthSignupProfileImage,
  usePostAuthSignupComplete as useCompleteSignupGen,
  useGetAuthMe,
  usePostAuthSignupProfileImage as useUploadSignupProfileImageGen,
} from '@/api/facades/generated/auth/auth'
import type { SignupCompleteRequest } from '@/api/facades/generated/peakdaApi.schemas'
import { applyAppTokenResponse, isNativeAndroid } from '@/lib/auth/nativeAuth'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function getCurrentUserApi() {
  const res = await getAuthMe()
  return res.data.data ?? null
}

export async function checkNicknameApi(nickname: string) {
  const res = await getAuthSignupNicknameCheck({ value: nickname })
  // res.data = Orval ?섑띁??body. ?낆뿉??data.data.available 濡??묎렐?섎?濡?body 瑜?諛섑솚?쒕떎.
  return res.data as unknown as {
    status: string
    code: string
    message: string
    data: { available: boolean }
  }
}

export async function completeSignupApi(payload: SignupCompleteRequest) {
  const res = await postAuthSignupComplete(payload)
  return res
}

export async function uploadSignupProfileImageApi(image: Blob) {
  const res = await postAuthSignupProfileImage({ image })
  return res.data.data ?? null
}

export async function refreshApi() {
  await postAuthRefresh()
}

export async function logoutApi() {
  await postAuthLogout()
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useCurrentUser = () =>
  useGetAuthMe({
    query: { select: (res) => res.data.data ?? null },
  })

// mutate({ data: { image } }) ?뺥깭濡??몄텧
// ?뚯썝媛???꾩떆 ?낅줈?????묐떟??profileImageKey 瑜?completeSignup ??profileImageUrl 濡??꾨떖
export const useUploadSignupProfileImage = () => useUploadSignupProfileImageGen()

// mutate({ data: payload }) ?뺥깭濡??몄텧
// ?깃났 ???좎? ?뺣낫 罹먯떆 ?먮룞 臾댄슚??
export const useCompleteSignup = () => {
  const queryClient = useQueryClient()
  return useCompleteSignupGen({
    mutation: {
      onSuccess: async (res) => {
        // 앱 가입은 signup token을 Bearer로 보내며, 완료 응답의 새 토큰 쌍으로 즉시 교체한다.
        if (isNativeAndroid() && res.data.data) await applyAppTokenResponse(res.data.data)
        await queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() })
      },
    },
  })
}
