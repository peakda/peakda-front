import { describe, it, expect } from 'vitest'
import { FLOWER_CATEGORIES } from './flower'
import { CATEGORY_ICON } from './map'
import { BloomCategory } from '@/api/facades/generated/peakdaApi.schemas'

// 지도 필터 드로어가 쓰는 목록. Figma 필터 기준이라 API enum 의 부분집합이다.
describe('constants/flower', () => {
  it('모든 항목이 API enum 에 있는 값이다', () => {
    const enumValues = Object.values(BloomCategory)
    for (const flower of FLOWER_CATEGORIES) {
      expect(enumValues).toContain(flower.value)
    }
  })

  // Figma 필터에 없어 뺐다. 서버 enum 에는 남아 있어 핀으로는 계속 내려온다.
  it('핑크뮬리는 필터 목록에서 제외한다', () => {
    expect(FLOWER_CATEGORIES.map((f) => f.value)).not.toContain('PINK_MUHLY')
  })

  // 필터에서 빠져도 핀 아이콘은 필요하므로 CATEGORY_ICON 에는 남아 있어야 한다.
  it('제외한 핑크뮬리도 핀 아이콘은 유지한다', () => {
    expect(CATEGORY_ICON.PINK_MUHLY).toBeTruthy()
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

  // enum 이름만 보면 _KR 이 철쭉처럼 읽혀 실제로 반대로 매핑돼 있었다(서버 displayName 기준이 정답).
  it('AZALEA_KR 이 진달래, AZALEA 가 철쭉이다', () => {
    const labelOf = (value: string) => FLOWER_CATEGORIES.find((f) => f.value === value)?.label
    expect(labelOf('AZALEA_KR')).toBe('진달래')
    expect(labelOf('AZALEA')).toBe('철쭉')
  })

  it('모든 항목이 계절 3개 중 하나에 속한다', () => {
    for (const flower of FLOWER_CATEGORIES) {
      expect(['SPRING', 'SUMMER', 'FALL']).toContain(flower.season)
    }
  })

  // Figma 지도 필터의 14종.
  it('필터에 노출할 라벨 목록', () => {
    expect(FLOWER_CATEGORIES.map((f) => f.label).sort()).toEqual(
      [
        '동백꽃',
        '매화',
        '개나리',
        '벚꽃',
        '진달래',
        '철쭉',
        '유채꽃',
        '해바라기',
        '수국',
        '연꽃',
        '코스모스',
        '국화',
        '단풍',
        '억새',
      ].sort()
    )
  })
})
