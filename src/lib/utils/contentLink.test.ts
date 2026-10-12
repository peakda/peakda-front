import { describe, expect, it } from 'vitest'
import { classifyContentLink, normalizeContentLinkUrl, toDisplayUrl } from '@/lib/utils/contentLink'

describe('lib/utils/contentLink', () => {
  describe('normalizeContentLinkUrl', () => {
    it('앞뒤 공백을 지우고 스킴이 없으면 https 를 붙인다', () => {
      expect(normalizeContentLinkUrl('  instagram.com/p/C5y7  ')).toBe(
        'https://instagram.com/p/C5y7'
      )
    })

    it('http/https 는 그대로 둔다', () => {
      expect(normalizeContentLinkUrl('http://blog.naver.com/a/1')).toBe('http://blog.naver.com/a/1')
      expect(normalizeContentLinkUrl('https://youtu.be/abc')).toBe('https://youtu.be/abc')
    })

    it('포트가 붙은 호스트를 스킴으로 오인하지 않는다', () => {
      expect(normalizeContentLinkUrl('instagram.com:443/p/1')).toBe('https://instagram.com:443/p/1')
    })

    it('빈 입력은 null', () => {
      expect(normalizeContentLinkUrl('   ')).toBeNull()
    })

    it('http/https 가 아닌 주소는 null', () => {
      expect(normalizeContentLinkUrl('javascript:alert(1)')).toBeNull()
      expect(normalizeContentLinkUrl('mailto:a@b.com')).toBeNull()
      expect(normalizeContentLinkUrl('ftp://example.com/file')).toBeNull()
    })

    it('userinfo 로 다른 도메인을 숨긴 주소는 null', () => {
      expect(normalizeContentLinkUrl('https://instagram.com@evil.com/p/1')).toBeNull()
    })

    it('호스트에 점이 없으면 null', () => {
      expect(normalizeContentLinkUrl('hello')).toBeNull()
    })

    it('2048자를 넘으면 null', () => {
      expect(normalizeContentLinkUrl(`https://a.com/${'x'.repeat(2048)}`)).toBeNull()
    })
  })

  describe('classifyContentLink', () => {
    it('서브도메인을 포함해 플랫폼을 분류한다', () => {
      expect(classifyContentLink('https://www.instagram.com/p/1')).toBe('INSTAGRAM')
      expect(classifyContentLink('https://m.blog.naver.com/a/1')).toBe('NAVER_BLOG')
      expect(classifyContentLink('https://m.youtube.com/watch?v=1')).toBe('YOUTUBE')
      expect(classifyContentLink('https://youtu.be/1')).toBe('YOUTUBE')
    })

    it('비슷하지만 다른 도메인은 미지원', () => {
      expect(classifyContentLink('https://notinstagram.com/p/1')).toBe('UNSUPPORTED')
      expect(classifyContentLink('https://cafe.naver.com/a')).toBe('UNSUPPORTED')
    })
  })

  it('toDisplayUrl 은 스킴과 www. 를 뗀다', () => {
    expect(toDisplayUrl('https://www.instagram.com/p/1')).toBe('instagram.com/p/1')
  })
})
