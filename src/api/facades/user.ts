import { useQueryClient } from '@tanstack/react-query'
import { getGetCurrentUserQueryKey } from '@/api/generated/auth/auth'
import {
  deleteProfileImage,
  uploadProfileImage,
  useDeleteProfileImage as useDeleteProfileImageGen,
  useUploadProfileImage as useUploadProfileImageGen,
} from '@/api/generated/user/user'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function uploadProfileImageApi(image: Blob) {
  const res = await uploadProfileImage({ image })
  return res.data.data ?? null
}

export async function deleteProfileImageApi() {
  await deleteProfileImage()
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

// mutate({ data: { image } }) 형태로 호출
// 성공 시 유저 정보 캐시 무효화
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()
  return useUploadProfileImageGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}

// 성공 시 유저 정보 캐시 무효화
export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient()
  return useDeleteProfileImageGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}
