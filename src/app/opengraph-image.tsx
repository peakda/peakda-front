import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// 페이지별 이미지가 없을 때 쓰는 기본 공유 카드. 이미지 파일을 따로 두지 않고 로고로 그린다.
// next/og 기본 폰트에 한글 글리프가 없어 문구는 영문만 쓴다.
// next/og(Satori)는 className 을 해석하지 못해 이 파일에서만 style 속성을 쓴다.

export const alt = '피크다 Peakda — 계절 명소 개화·절정 타이밍'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/images/logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
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
        <div style={{ fontSize: 40, color: '#386d19' }}>Catch every season at its peak</div>
      </div>
    ),
    size
  )
}
