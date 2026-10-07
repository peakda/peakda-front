import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// 페이지별 이미지가 없을 때 쓰는 기본 공유 카드. 이미지 파일을 따로 두지 않고 로고로 그린다.
// next/og 기본 폰트에 한글 글리프가 없어 로컬 Pretendard 폰트를 함께 넣는다.
// next/og(Satori)는 className 을 해석하지 못해 이 파일에서만 style 속성을 쓴다.

export const alt = '계절 명소의 타이밍을 한눈에, 지금 이 순간 가장 예쁜 곳은 피크다에서!'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const [logo, koreanFont] = await Promise.all([
    readFile(join(process.cwd(), 'public/images/logo.png')),
    readFile(join(process.cwd(), 'public/fonts/og-korean-semibold.otf')),
  ])
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: '#f0f8e8',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 는 next/image 를 렌더하지 못한다 */}
      <img src={logoSrc} alt="" width={200} height={200} />
      <div style={{ fontSize: 120, fontWeight: 700, color: '#285011', letterSpacing: -2 }}>
        Peakda
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'OGKorean',
          fontSize: 40,
          fontWeight: 600,
          color: '#386d19',
        }}
      >
        <span>계절 명소의 타이밍을 한눈에,</span>
        <span>지금 이 순간 가장 예쁜 곳은 피크다에서!</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'OGKorean',
          data: new Uint8Array(koreanFont).buffer,
          weight: 600,
          style: 'normal',
        },
      ],
    }
  )
}
