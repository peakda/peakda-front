import { getFestivalsById } from '@/api/facades/generated/festival/festival'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 축제 상세. 서버 컴포넌트(metadata·첫 HTML)에서 조회한다. 사용자와 무관한 공개 데이터라 클라이언트 재조회는 하지 않는다.
// 발행된 에디토리얼이 없으면 editorial 이 null 이고 기본 정보만 내려온다.
export async function festivalDetailApi(id: number, options?: RequestInit) {
  const res = await getFestivalsById(id, options)
  return res.data.data ?? null
}
