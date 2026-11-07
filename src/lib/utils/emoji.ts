import type { EmojiDefinitionResponse } from '@/api/facades/generated/peakdaApi.schemas'

const TWEMOJI_VERSION = '17.0.3'

// 아래 규칙의 유일한 예외 — 👁️‍🗨️ 파일만 ZWJ 가 있어도 VS16 이 빠진 이름으로 저장돼 있다.
const TWEMOJI_FILE_OVERRIDES: Record<string, string> = {
  '1f441-fe0f-200d-1f5e8-fe0f': '1f441-200d-1f5e8',
}

/**
 * 유니코드 이모지 문자를 twemoji SVG 이미지 URL로 변환한다.
 * 파일명이 코드포인트 조합(하이픈 연결)이라 변환이 필요하다.
 * VS16(FE0F)은 ZWJ(200D) 없는 이모지의 파일명에서만 빠진다 — 🏳️‍🌈 는 1f3f3-fe0f-200d-1f308.svg 다.
 */
export function toTwemojiUrl(emoji: string): string {
  const codepoints = [...emoji].map((char) => char.codePointAt(0)!.toString(16))
  const name = codepoints.includes('200d')
    ? codepoints.join('-')
    : codepoints.filter((codepoint) => codepoint !== 'fe0f').join('-')

  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@${TWEMOJI_VERSION}/assets/svg/${TWEMOJI_FILE_OVERRIDES[name] ?? name}.svg`
}

const SKIN_TONE_KEY = /\b1f3f[b-f]\b/

/**
 * 카탈로그를 피커 탭(Unicode 그룹)별로 묶는다. 피부톤 변형(2,030종)은 뺀다 —
 * 넣으면 사람 탭만 2,418개라 가상 스크롤이 필요하다. 응답에 담긴 반응의 표시는 영향받지 않는다.
 */
export function groupPickerEmojis(
  items: EmojiDefinitionResponse[]
): Map<string, EmojiDefinitionResponse[]> {
  const groups = new Map<string, EmojiDefinitionResponse[]>()
  for (const item of items) {
    if (SKIN_TONE_KEY.test(item.key)) continue
    const group = groups.get(item.group)
    if (group) group.push(item)
    else groups.set(item.group, [item])
  }
  return groups
}
