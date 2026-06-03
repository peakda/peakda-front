import { useQueryClient } from '@tanstack/react-query'
import {
  checkNickname,
  completeSignup,
  getCurrentUser,
  getGetCurrentUserQueryKey,
  logout,
  refresh,
  uploadSignupProfileImage,
  useCompleteSignup as useCompleteSignupGen,
  useGetCurrentUser,
  useUploadSignupProfileImage as useUploadSignupProfileImageGen,
} from '@/api/generated/auth/auth'
import type { SignupCompleteRequest } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function getCurrentUserApi() {
  const res = await getCurrentUser()
  return res.data.data ?? null
}

export async function checkNicknameApi(nickname: string) {
  const res = await checkNickname({ value: nickname })
  return res as unknown as {
    status: string
    code: string
    message: string
    data: { available: boolean }
  }
}

export async function completeSignupApi(payload: SignupCompleteRequest) {
  const res = await completeSignup(payload)
  return res
}

export async function uploadSignupProfileImageApi(image: Blob) {
  const res = await uploadSignupProfileImage({ image })
  return res.data.data ?? null
}

export async function refreshApi() {
  await refresh()
}

export async function logoutApi() {
  await logout()
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const useCurrentUser = () =>
  useGetCurrentUser({
    query: { select: (res) => res.data.data ?? null },
  })

// mutate({ data: { image } }) 형태로 호출
// 회원가입 임시 업로드 — 응답의 profileImageKey 를 completeSignup 의 profileImageUrl 로 전달
export const useUploadSignupProfileImage = () => useUploadSignupProfileImageGen()

// mutate({ data: payload }) 형태로 호출
// 성공 시 유저 정보 캐시 자동 무효화
export const useCompleteSignup = () => {
  const queryClient = useQueryClient()
  return useCompleteSignupGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}
