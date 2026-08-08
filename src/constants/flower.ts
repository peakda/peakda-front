import type { BloomSlotCategory } from '@/api/facades/generated/peakdaApi.schemas'
import { CATEGORY_ICON } from '@/constants/map'

export type FlowerSeason = 'SPRING' | 'SUMMER' | 'FALL'

export interface FlowerCategoryMeta {
  value: BloomSlotCategory
  label: string
  /** 카드에 표시할 대략적인 개화 시기 */
  months: string
  image: string
  season: FlowerSeason
}

// 아이콘은 지도 핀과 어긋나지 않도록 CATEGORY_ICON 한 곳에서만 끌어온다.
const define = (
  value: BloomSlotCategory,
  label: string,
  months: string,
  season: FlowerSeason
): FlowerCategoryMeta => ({ value, label, months, image: CATEGORY_ICON[value], season })

/**
 * 꽃 카테고리 단일 소스 — 프로필 편집(관심 꽃)과 지도 필터 드로어가 이 목록만 쓴다.
 * API enum 13개와 1:1. 필터 드로어에만 있던 해바라기·국화는 enum 에 없어 제외했고,
 * 빠져 있던 핑크뮬리를 넣어 양쪽을 통일했다.
 */
export const FLOWER_CATEGORIES: FlowerCategoryMeta[] = [
  define('PLUM', '매화', '1-2월', 'SPRING'),
  define('CAMELLIA', '동백꽃', '11-3월', 'SPRING'),
  define('CHERRY', '벚꽃', '3-4월', 'SPRING'),
  define('FORSYTHIA', '개나리', '3-4월', 'SPRING'),
  define('AZALEA', '진달래', '3-4월', 'SPRING'),
  define('CANOLA', '유채꽃', '4-5월', 'SPRING'),
  define('AZALEA_KR', '철쭉', '4-5월', 'SPRING'),
  define('HYDRANGEA', '수국', '6-8월', 'SUMMER'),
  define('LOTUS', '연꽃', '7-8월', 'SUMMER'),
  define('COSMOS', '코스모스', '9-10월', 'FALL'),
  define('PINK_MUHLY', '핑크뮬리', '9-11월', 'FALL'),
  define('MAPLE', '단풍', '10-11월', 'FALL'),
  define('SILVERGRASS', '억새', '9-11월', 'FALL'),
]
