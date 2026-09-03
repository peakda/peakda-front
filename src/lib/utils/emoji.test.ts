import { describe, expect, it } from 'vitest'
import { toTwemojiUrl } from './emoji'

describe('toTwemojiUrl', () => {
  it('converts a single-codepoint emoji to its twemoji svg url', () => {
    expect(toTwemojiUrl('😀')).toBe(
      'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f600.svg'
    )
  })

  it('strips the VS16 variation selector from emoji that include it', () => {
    expect(toTwemojiUrl('❤️')).toBe(
      'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2764.svg'
    )
  })
})
