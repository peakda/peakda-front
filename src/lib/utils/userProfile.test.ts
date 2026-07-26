import { describe, it, expect } from 'vitest'
import type {
  Stats,
  FavoriteCategoryResponse,
  BlockedUserResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { toProfileStats, toFavoriteFlowerLabels, toBlockedRow } from './userProfile'

describe('utils/userProfile', () => {
  it('toProfileStats — 숫자 통계를 문자열로 변환', () => {
    const stats: Stats = { recordCount: 24, followerCount: 128, followingCount: 7 }
    expect(toProfileStats(stats)).toEqual({
      recordCount: '24',
      followerCount: '128',
      followingCount: '7',
    })
  })

  it('toProfileStats — 0도 문자열 "0"', () => {
    const stats: Stats = { recordCount: 0, followerCount: 0, followingCount: 0 }
    expect(toProfileStats(stats)).toEqual({
      recordCount: '0',
      followerCount: '0',
      followingCount: '0',
    })
  })

  it('toFavoriteFlowerLabels — 표시명 배열 추출', () => {
    const fav: FavoriteCategoryResponse = {
      categories: [
        { category: 'CHERRY_BLOSSOM' as never, displayName: '벚꽃' },
        { category: 'MAPLE' as never, displayName: '단풍' },
      ],
    }
    expect(toFavoriteFlowerLabels(fav)).toEqual(['벚꽃', '단풍'])
  })

  it('toFavoriteFlowerLabels — 빈 목록은 빈 배열', () => {
    expect(toFavoriteFlowerLabels({ categories: [] })).toEqual([])
  })

  it('toBlockedRow — 차단 항목 매핑 및 날짜 포맷', () => {
    const b: BlockedUserResponse = {
      userId: 42,
      nickname: '차단유저',
      profileImageUrl: 'https://cdn/img.png',
      blockedAt: '2026-07-01T12:34:56Z',
    }
    expect(toBlockedRow(b)).toEqual({
      userId: 42,
      nickname: '차단유저',
      profileImageUrl: 'https://cdn/img.png',
      blockedAtLabel: '2026.07.01',
    })
  })

  it('toBlockedRow — 프로필 이미지 없으면 null', () => {
    const b: BlockedUserResponse = {
      userId: 1,
      nickname: '홍길동',
      blockedAt: '2026-01-15',
    }
    expect(toBlockedRow(b).profileImageUrl).toBeNull()
  })
})
