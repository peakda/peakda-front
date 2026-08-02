import { useGetFestivalsById } from '@/api/facades/generated/festival/festival'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 축제 상세. 발행된 에디토리얼이 없으면 editorial 이 null 이고 기본 정보만 내려온다.
export const useFestivalDetail = (id: number | undefined) =>
  useGetFestivalsById(id ?? 0, {
    query: { enabled: !!id, select: (res) => res.data.data ?? null },
  })
