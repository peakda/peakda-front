export type RegionKey = 'CAPITAL' | 'GANGWON' | 'CHUNGCHEONG' | 'GYEONGSANG' | 'JEOLLA' | 'JEJU'

export interface RegionMeta {
  key: RegionKey
  label: string
  subLabel: string
  center: { lat: number; lng: number }
  /** 카카오맵 레벨 — 숫자가 클수록 넓게 보인다 */
  level: number
}

/**
 * 지역은 "필터"가 아니라 **지도 이동**이다.
 * 지도 응답(`BloomMapPin`)에 주소·권역 필드가 없어 좌표로 권역을 판정하면 경계가 부정확하다.
 * 대신 해당 권역으로 지도를 옮기면, 개수·목록이 "화면에 보이는 것" 기준이라 자연히 그 지역만 남는다.
 */
export const REGIONS: RegionMeta[] = [
  {
    key: 'CAPITAL',
    label: '수도권',
    subLabel: '서울 · 경기 · 인천 등',
    center: { lat: 37.55, lng: 127.0 },
    level: 9,
  },
  {
    key: 'GANGWON',
    label: '강원도',
    subLabel: '강릉 · 속초 · 춘천 등',
    center: { lat: 37.8, lng: 128.3 },
    level: 10,
  },
  {
    key: 'CHUNGCHEONG',
    label: '충청도',
    subLabel: '대전 · 공주 · 천안 등',
    center: { lat: 36.5, lng: 127.3 },
    level: 10,
  },
  {
    key: 'GYEONGSANG',
    label: '경상도',
    subLabel: '부산 · 경주 · 진해 등',
    center: { lat: 35.8, lng: 128.6 },
    level: 10,
  },
  {
    key: 'JEOLLA',
    label: '전라도',
    subLabel: '광주 · 전주 · 순천 등',
    center: { lat: 35.3, lng: 127.0 },
    level: 10,
  },
  {
    key: 'JEJU',
    label: '제주도',
    subLabel: '제주 · 서귀포',
    center: { lat: 33.38, lng: 126.55 },
    level: 9,
  },
]
