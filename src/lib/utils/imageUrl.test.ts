import { describe, expect, it } from 'vitest'
import { toHttpsImageUrl } from './imageUrl'

describe('toHttpsImageUrl', () => {
  it('converts insecure remote URLs to HTTPS', () => {
    expect(toHttpsImageUrl('http://img1.kakaocdn.net/image.png')).toBe(
      'https://img1.kakaocdn.net/image.png'
    )
  })

  it('keeps safe, relative, and empty values unchanged', () => {
    expect(toHttpsImageUrl('https://cdn.example.com/image.png')).toBe('https://cdn.example.com/image.png')
    expect(toHttpsImageUrl('/icons/person.svg')).toBe('/icons/person.svg')
    expect(toHttpsImageUrl(null)).toBeNull()
  })
})
