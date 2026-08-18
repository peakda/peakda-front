export type RegionKey = 'CAPITAL' | 'GANGWON' | 'CHUNGCHEONG' | 'GYEONGSANG' | 'JEOLLA' | 'JEJU'

export interface RegionMeta {
  key: RegionKey
  label: string
  subLabel: string
}

/**
 * 필터 드로어의 권역 목록. key 는 `GET /api/seasonal/blooms` 의 `region` 파라미터로 그대로 나간다.
 *
 * 서버가 권역을 bbox 와 AND 로 적용하므로, 보고 있는 지도 밖의 권역을 고르면 결과가 비는 게 정상이다.
 * 표시 문구는 서버가 내려주지 않아(권역 목록 API 가 없다) 여기서 관리한다.
 */
export const REGIONS: RegionMeta[] = [
  { key: 'CAPITAL', label: '수도권', subLabel: '서울 · 경기 · 인천 등' },
  { key: 'GANGWON', label: '강원도', subLabel: '강릉 · 속초 · 춘천 등' },
  { key: 'CHUNGCHEONG', label: '충청도', subLabel: '대전 · 공주 · 천안 등' },
  { key: 'GYEONGSANG', label: '경상도', subLabel: '부산 · 경주 · 진해 등' },
  { key: 'JEOLLA', label: '전라도', subLabel: '광주 · 전주 · 순천 등' },
  { key: 'JEJU', label: '제주도', subLabel: '제주 · 서귀포' },
]
