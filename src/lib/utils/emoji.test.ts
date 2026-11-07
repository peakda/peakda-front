import { describe, expect, it } from 'vitest'
import { groupPickerEmojis, toTwemojiUrl } from './emoji'

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg'

describe('toTwemojiUrl', () => {
  it('converts a single-codepoint emoji to its twemoji svg url', () => {
    expect(toTwemojiUrl('😀')).toBe(`${BASE}/1f600.svg`)
  })

  it('strips the VS16 variation selector from emoji without a ZWJ', () => {
    expect(toTwemojiUrl('❤️')).toBe(`${BASE}/2764.svg`)
  })

  it('keeps the VS16 variation selector in ZWJ sequences', () => {
    expect(toTwemojiUrl('🏳️‍🌈')).toBe(`${BASE}/1f3f3-fe0f-200d-1f308.svg`)
  })

  it('uses the stored file name for the one sequence that breaks the rule', () => {
    expect(toTwemojiUrl('👁️‍🗨️')).toBe(`${BASE}/1f441-200d-1f5e8.svg`)
  })
})

describe('groupPickerEmojis', () => {
  const emoji = (key: string, group: string) => ({ key, emoji: key, group })

  it('groups items by unicode group in catalog order', () => {
    const groups = groupPickerEmojis([
      emoji('u:1f600', 'Smileys & Emotion'),
      emoji('u:1f338', 'Animals & Nature'),
      emoji('u:1f601', 'Smileys & Emotion'),
    ])
    expect(groups.get('Smileys & Emotion')?.map((item) => item.key)).toEqual([
      'u:1f600',
      'u:1f601',
    ])
    expect(groups.get('Animals & Nature')?.map((item) => item.key)).toEqual(['u:1f338'])
  })

  it('drops skin tone variants anywhere in the sequence', () => {
    const groups = groupPickerEmojis([
      emoji('u:1f44d', 'People & Body'),
      emoji('u:1f44d-1f3fb', 'People & Body'),
      emoji('u:1f9d1-1f3ff-200d-1f33e', 'People & Body'),
    ])
    expect(groups.get('People & Body')?.map((item) => item.key)).toEqual(['u:1f44d'])
  })
})
