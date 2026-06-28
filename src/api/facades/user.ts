import { useQueryClient } from '@tanstack/react-query'
import { getGetCurrentUserQueryKey } from '@/api/facades/generated/auth/auth'
import {
  deleteProfileImage,
  uploadProfileImage,
  useDeleteProfileImage as useDeleteProfileImageGen,
  useUploadProfileImage as useUploadProfileImageGen,
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

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

// mutate({ data: { image } }) ?뺥깭濡??몄텧
// ?깃났 ???좎? ?뺣낫 罹먯떆 臾댄슚??
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
