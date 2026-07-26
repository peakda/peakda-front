import { useQueryClient } from '@tanstack/react-query'
import { getGetCurrentUserQueryKey } from '@/api/facades/generated/auth/auth'
import {
  deleteProfileImage,
  getMyPage,
  uploadProfileImage,
  useDeleteProfileImage as useDeleteProfileImageGen,
  useGetMyPage,
  useUpdateFavoriteCategories as useUpdateFavoriteCategoriesGen,
  useUploadProfileImage as useUploadProfileImageGen,
  withdraw,
} from '@/api/facades/generated/user/user'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function uploadProfileImageApi(image: Blob) {
  const res = await uploadProfileImage({ image })
  return res.data.data ?? null
}

export async function deleteProfileImageApi() {
  await deleteProfileImage()
}

// 계정 탈퇴. 서버가 인증 쿠키를 만료시키므로 호출 후 로그인 화면으로 보낸다(호출부 담당).
export async function withdrawApi() {
  await withdraw()
}

// 마이페이지 집계(내 정보 + 통계)
export async function myPageApi() {
  const res = await getMyPage()
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

// mutate({ data: { image } }) ?뺥깭濡??몄텧
// ?깃났 ???좎? ?뺣낫 罹먯떆 臾댄슚??
// 마이페이지 집계 조회
export const useMyPage = () =>
  useGetMyPage({ query: { select: (res) => res.data.data ?? null } })

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()
  return useUploadProfileImageGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}

// ?깃났 ???좎? ?뺣낫 罹먯떆 臾댄슚??
export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient()
  return useDeleteProfileImageGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}

// mutate({ data: { categories } }) 형태로 호출 (전체 교체, 최소 1개)
// 성공 시 현재 유저 정보 캐시 무효화
export const useUpdateFavoriteCategories = () => {
  const queryClient = useQueryClient()
  return useUpdateFavoriteCategoriesGen({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }),
    },
  })
}
