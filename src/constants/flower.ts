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
 * 꽃 카테고리 — 지도 필터 드로어가 쓴다. Figma 필터 14종 기준이라 API enum(15종)의 부분집합이다.
 * 순서도 Figma 를 따른다(여름: 해바라기·수국·연꽃 / 가을·겨울: 코스모스·국화·단풍·억새).
 *
 * 핑크뮬리는 Figma 필터에 없어 제외했다. 서버 enum 에는 남아 있어 핀으로는 계속 내려오므로,
 * 지도에는 정상 표시되고 필터 항목으로만 안 뜬다(아이콘은 CATEGORY_ICON 에 유지).
 *
 * 주의: 프로필(`app/profile/page.tsx`)·프로필 편집(`app/profile/edit/page.tsx`)은 요청 DTO 별로
 * enum 타입이 갈려 각자 FLOWER_LIST 를 따로 들고 있다. 라벨을 고칠 때 세 곳을 함께 봐야 한다.
 */
export const FLOWER_CATEGORIES: FlowerCategoryMeta[] = [
  define('PLUM', '매화', '1-2월', 'SPRING'),
  define('CAMELLIA', '동백꽃', '11-3월', 'SPRING'),
  define('CHERRY', '벚꽃', '3-4월', 'SPRING'),
  define('FORSYTHIA', '개나리', '3-4월', 'SPRING'),
  // enum 이름만 보면 _KR 이 철쭉일 것 같지만 서버 displayName 기준은 AZALEA_KR=진달래, AZALEA=철쭉이다.
  define('AZALEA_KR', '진달래', '3-4월', 'SPRING'),
  define('CANOLA', '유채꽃', '4-5월', 'SPRING'),
  define('AZALEA', '철쭉', '4-5월', 'SPRING'),
  define('SUNFLOWER', '해바라기', '7-9월', 'SUMMER'),
  define('HYDRANGEA', '수국', '6-8월', 'SUMMER'),
  define('LOTUS', '연꽃', '7-8월', 'SUMMER'),
  define('COSMOS', '코스모스', '9-10월', 'FALL'),
  define('CHRYSANTHEMUM', '국화', '9-11월', 'FALL'),
  define('MAPLE', '단풍', '10-11월', 'FALL'),
  define('SILVERGRASS', '억새', '9-11월', 'FALL'),
]

// '동백'↔'동백꽃', '단풍나무'↔'단풍'처럼 표기가 조금 달라도 같은 꽃으로 본다.
const normalizeFlowerName = (name: string) => name.replace(/\s/g, '').replace(/(꽃|나무)$/, '')

const FLOWER_IMAGE_BY_NAME = new Map(
  FLOWER_CATEGORIES.map((f) => [normalizeFlowerName(f.label), f.image])
)

/**
 * 식물 이름 → 필터 드로어의 꽃 사진. 기록의 식물(PlantSummary)에는 카테고리가 없어 이름으로 찾는다.
 * 사용자가 직접 추가한 식물처럼 필터 목록에 없는 이름이면 undefined.
 */
export function findFlowerImageByName(name: string): string | undefined {
  return FLOWER_IMAGE_BY_NAME.get(normalizeFlowerName(name))
}
