import type { SpotSearchItem, UserSearchItem } from '@/api/facades/generated/peakdaApi.schemas'
import type { SPOTProps } from '@/app/search/_components/SpotPanel'
import type { UserProps } from '@/app/search/_components/UserPanel'
import { toStatusBadge } from '@/lib/utils/bloomStatus'

// 최근 검색어 localStorage 키
export const RECENT_SEARCH_KEY = 'peakda:recent-searches'

// 최근 검색어 보관 개수
const RECENT_LIMIT = 10

const SPOT_TYPE_LABEL: Record<SpotSearchItem['type'], string> = {
  ATTRACTION: '명소',
  LOCAL: '동네',
}

export const toSpotProps = (item: SpotSearchItem): SPOTProps => {
  const typeLabel = SPOT_TYPE_LABEL[item.type]
  return {
    id: item.spotId,
    name: item.name,
    location: item.address ?? '',
    imageUrl: item.thumbnailUrl,
    ...toStatusBadge(item.bloom?.status),
    // 식물 태그 자리가 비어 있어 명소/동네 구분을 대신 노출한다.
    nameList: typeLabel ? [typeLabel] : [],
    favorited: item.favorited,
    notifyEnabled: item.notifyEnabled,
  }
}

export const toUserProps = (item: UserSearchItem): UserProps => ({
  id: item.userId,
  name: item.nickname,
  stats: `기록 ${item.recordCount} · 팔로워 ${item.followerCount}`,
  following: item.following,
  imageUrl: item.profileImageUrl ?? null,
})

// 중복은 제거하고 맨 앞에 넣는다. 빈 검색어는 쌓지 않는다.
export const addRecentSearch = (list: string[], keyword: string): string[] => {
  const trimmed = keyword.trim()
  if (trimmed.length === 0) return list
  return [trimmed, ...list.filter((item) => item !== trimmed)].slice(0, RECENT_LIMIT)
}

export const removeRecentSearch = (list: string[], keyword: string): string[] =>
  list.filter((item) => item !== keyword)

// localStorage 원문 → 최근 검색어. 손상된 값이 저장돼 있어도 화면이 죽지 않도록 방어한다.
export const readRecentSearches = (raw: string | null): string[] => {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}
