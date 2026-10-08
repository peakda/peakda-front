import { describe, expect, it } from 'vitest'
import { toHttpsImageUrl, toSmallAvatarUrl } from './imageUrl'

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

describe('toSmallAvatarUrl', () => {
  it('카카오 사용자 사진은 110px 판으로 바꾼다', () => {
    expect(
      toSmallAvatarUrl('https://k.kakaocdn.net/dn/BjsQd/dJMcaaG99Vl/zr1aFk6YycjYEdRHvtlEG1/img_640x640.jpg')
    ).toBe('https://k.kakaocdn.net/dn/BjsQd/dJMcaaG99Vl/zr1aFk6YycjYEdRHvtlEG1/img_110x110.jpg')
  })

  it('카카오 기본 프로필은 썸네일 크기만 바꾼다', () => {
    expect(
      toSmallAvatarUrl(
        'https://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http%3A%2F%2Ft1.kakaocdn.net%2Faccount_images%2Fdefault_profile.jpeg'
      )
    ).toBe(
      'https://img1.kakaocdn.net/thumb/R110x110.q70/?fname=http%3A%2F%2Ft1.kakaocdn.net%2Faccount_images%2Fdefault_profile.jpeg'
    )
  })

  it('카카오가 아닌 주소는 그대로 둔다', () => {
    expect(toSmallAvatarUrl('https://cdn.peakda.com/profile-images/9/thumbnail.jpg')).toBe(
      'https://cdn.peakda.com/profile-images/9/thumbnail.jpg'
    )
    expect(toSmallAvatarUrl('https://example.com/img_640x640.jpg')).toBe(
      'https://example.com/img_640x640.jpg'
    )
  })
})
