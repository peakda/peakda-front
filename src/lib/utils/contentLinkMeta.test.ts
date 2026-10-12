import { describe, expect, it } from 'vitest'
import {
  parseInstagramEmbed,
  parseOgMeta,
  toInstagramEmbedUrl,
  toNaverBlogMobileUrl,
} from '@/lib/utils/contentLinkMeta'

// 2026-10-12 실제 응답에서 필요한 부분만 잘라 낸 HTML
const NAVER_POST_HTML = `<html><head>
<meta property="og:title" content="[블로그 있어요!] 이연의 노트"/>
<meta property="og:description" content="마지막 &lsquo;블로그 있어요!&rsquo;의 주인공은 크리에이터 이연입니다. ..."/>
</head><body></body></html>`

const NAVER_HOME_HTML = `<meta property="og:title" content="네이버 블로그팀 공식블로그 : 네이버 블로그"/>`

const INSTAGRAM_EMBED_HTML = `<div class="Embed"><span class="UsernameText">world_record_egg</span>
<div class="Caption"><a class="CaptionUsername" href="https://www.instagram.com/world_record_egg/">world_record_egg</a><br /><br />Let’s set a world record together &amp; get the most liked post 🙌<br /><br /><a href="/explore/tags/LikeTheEgg/">#LikeTheEgg</a><div class="CaptionComments"><a class="CaptionCommentsExpand" href="#">View all 4,000,000 comments</a></div></div></div>`

const INSTAGRAM_NO_CAPTION_HTML = `<span class="UsernameText">louin_travel</span>`

const INSTAGRAM_UNAVAILABLE_HTML = `<div class="EmbedIsBroken">This post is unavailable.</div>`

describe('lib/utils/contentLinkMeta', () => {
  describe('toNaverBlogMobileUrl', () => {
    it('blog.naver.com 을 m.blog.naver.com 으로 바꾸고 경로·쿼리는 유지한다', () => {
      expect(toNaverBlogMobileUrl('https://blog.naver.com/blogpeople/224431853734')).toBe(
        'https://m.blog.naver.com/blogpeople/224431853734'
      )
      expect(toNaverBlogMobileUrl('http://blog.naver.com/PostView.naver?blogId=a&logNo=1')).toBe(
        'https://m.blog.naver.com/PostView.naver?blogId=a&logNo=1'
      )
    })
  })

  describe('toInstagramEmbedUrl', () => {
    it('게시물·릴스·계정 포함 주소에서 코드를 뽑아 임베드 주소를 만든다', () => {
      const embed = 'https://www.instagram.com/p/BsOGulcndj-/embed/captioned/'
      expect(toInstagramEmbedUrl('https://www.instagram.com/p/BsOGulcndj-/')).toBe(embed)
      expect(toInstagramEmbedUrl('https://instagram.com/reel/BsOGulcndj-?igsh=x')).toBe(embed)
      expect(toInstagramEmbedUrl('https://www.instagram.com/world_record_egg/p/BsOGulcndj-/')).toBe(
        embed
      )
    })

    it('게시물이 아닌 주소는 null', () => {
      expect(toInstagramEmbedUrl('https://www.instagram.com/instagram/')).toBeNull()
    })
  })

  describe('parseOgMeta', () => {
    it('og:title·og:description 을 뽑고 HTML 엔티티를 풀어 준다', () => {
      expect(parseOgMeta(NAVER_POST_HTML)).toEqual({
        title: '[블로그 있어요!] 이연의 노트',
        description: '마지막 ‘블로그 있어요!’의 주인공은 크리에이터 이연입니다. ...',
      })
    })

    it("블로그 홈 제목의 ' : 네이버 블로그' 를 뗀다", () => {
      expect(parseOgMeta(NAVER_HOME_HTML)).toEqual({ title: '네이버 블로그팀 공식블로그' })
    })

    it('og:title 이 없으면 null', () => {
      expect(parseOgMeta('<html><head></head></html>')).toBeNull()
    })
  })

  describe('parseInstagramEmbed', () => {
    it('@계정과 본문을 뽑는다 (계정 링크·댓글 영역 제외, 줄바꿈은 한 칸)', () => {
      expect(parseInstagramEmbed(INSTAGRAM_EMBED_HTML)).toEqual({
        title: '@world_record_egg',
        description: 'Let’s set a world record together & get the most liked post 🙌 #LikeTheEgg',
      })
    })

    it('본문이 없으면 계정만', () => {
      expect(parseInstagramEmbed(INSTAGRAM_NO_CAPTION_HTML)).toEqual({ title: '@louin_travel' })
    })

    it('비공개·삭제된 게시물은 null', () => {
      expect(parseInstagramEmbed(INSTAGRAM_UNAVAILABLE_HTML)).toBeNull()
    })
  })
})
