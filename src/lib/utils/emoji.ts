const TWEMOJI_VERSION = '14.0.2'

/**
 * 유니코드 이모지 문자를 twemoji SVG 이미지 URL로 변환한다.
 * 파일명이 코드포인트 조합(하이픈 연결)이라 변환이 필요하고,
 * VS16(FE0F)은 twemoji 에셋 파일명에서 제외되므로 걸러낸다.
 */
export function toTwemojiUrl(emoji: string): string {
  const codepoints = [...emoji]
    .map((char) => char.codePointAt(0)!.toString(16))
    .filter((codepoint) => codepoint !== 'fe0f')
    .join('-')

  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/svg/${codepoints}.svg`
}
