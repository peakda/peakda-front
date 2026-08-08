import { describe, it, expect } from 'vitest'
import { FLOWER_CATEGORIES } from './flower'
import { CATEGORY_ICON } from './map'
import { BloomCategory } from '@/api/facades/generated/peakdaApi.schemas'

// 프론트에 꽃 목록이 두 벌(프로필 편집 / 필터 드로어) 있고 서로 달랐던 것을 한 벌로 통일한다.
// 필터 드로어 쪽에만 있던 해바라기·국화는 API enum 에 없어 제거하고, 빠져 있던 핑크뮬리를 넣는다.
describe('constants/flower', () => {
  it('API enum 13개와 정확히 같은 집합이다', () => {
    const expected = Object.values(BloomCategory).sort()
    const actual = FLOWER_CATEGORIES.map((f) => f.value).sort()

    expect(actual).toHaveLength(13)
    expect(actual).toEqual(expected)
  })

  it('enum 에 없는 해바라기·국화를 포함하지 않는다', () => {
    const labels = FLOWER_CATEGORIES.map((f) => f.label)
    expect(labels).not.toContain('해바라기')
    expect(labels).not.toContain('국화')
  })

  it('핑크뮬리가 포함된다', () => {
    expect(FLOWER_CATEGORIES.map((f) => f.value)).toContain('PINK_MUHLY')
  })

  it('value 와 label 에 중복이 없다', () => {
    const values = FLOWER_CATEGORIES.map((f) => f.value)
    const labels = FLOWER_CATEGORIES.map((f) => f.label)
    expect(new Set(values).size).toBe(values.length)
    expect(new Set(labels).size).toBe(labels.length)
  })

  // 필터 드로어가 억새·국화에 엉뚱하게 cherry-blossom.svg 를 쓰고 있었다. 지도 아이콘과 강제로 일치시킨다.
  it('아이콘이 지도 CATEGORY_ICON 과 일치한다', () => {
    for (const flower of FLOWER_CATEGORIES) {
      expect(flower.image).toBe(CATEGORY_ICON[flower.value])
    }
  })

  it('모든 항목이 계절 3개 중 하나에 속한다', () => {
    for (const flower of FLOWER_CATEGORIES) {
      expect(['SPRING', 'SUMMER', 'FALL']).toContain(flower.season)
    }
  })

  it('프로필 편집에서 쓰던 13개 라벨을 그대로 유지한다', () => {
    expect(FLOWER_CATEGORIES.map((f) => f.label).sort()).toEqual(
      [
        '동백꽃',
        '매화',
        '개나리',
        '벚꽃',
        '진달래',
        '철쭉',
        '유채꽃',
        '수국',
        '연꽃',
        '코스모스',
        '단풍',
        '핑크뮬리',
        '억새',
      ].sort()
    )
  })
})
