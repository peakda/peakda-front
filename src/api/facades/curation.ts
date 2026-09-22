import { getCurationsById } from '@/api/facades/generated/curation/curation'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 발행 큐레이션 상세. 서버 컴포넌트(metadata·첫 HTML)에서 조회한다.
// lat·lng 를 넘기지 않으므로 distanceMeters 는 항상 null 이다(현재 위치를 받는 UI 가 없다).
export async function curationDetailApi(id: number, options?: RequestInit) {
  const res = await getCurationsById(id, undefined, options)
  return res.data.data ?? null
}
