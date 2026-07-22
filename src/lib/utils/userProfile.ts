import type {
  Stats,
  FavoriteCategoryResponse,
  BlockedUserResponse,
} from '@/api/facades/generated/peakdaApi.schemas'

// ISO 문자열(날짜/일시) → 'YYYY.MM.DD'
const toDot = (iso: string) => iso.slice(0, 10).replaceAll('-', '.')

// Stats → ProfileStats props (컴포넌트가 문자열 props를 받으므로 문자열화)
export function toProfileStats(stats: Stats): {
  recordCount: string
  followerCount: string
  followingCount: string
} {
  return {
    recordCount: String(stats.recordCount),
    followerCount: String(stats.followerCount),
    followingCount: String(stats.followingCount),
  }
}

// 관심 꽃 카테고리 → InterestFlowerSection 라벨 배열 (표시명 추출)
export function toFavoriteFlowerLabels(fav: FavoriteCategoryResponse): string[] {
  return fav.categories.map((item) => item.displayName)
}

export interface BlockedRow {
  userId: number
  nickname: string
  profileImageUrl: string | null
  blockedAtLabel: string
}

// BlockedUserResponse → 차단 목록 행 UI 데이터
export function toBlockedRow(b: BlockedUserResponse): BlockedRow {
  return {
    userId: b.userId,
    nickname: b.nickname,
    profileImageUrl: b.profileImageUrl ?? null,
    blockedAtLabel: toDot(b.blockedAt),
  }
}
