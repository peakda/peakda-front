import Image from 'next/image'

export function MainMessage() {
  return (
    <div>
      <Image
        src={'/images/logo.png'}
        alt="피크다 Peakda 로고"
        width={128}
        height={120}
        className="mx-auto h-32 w-32"
        priority
        quality={70}
        placeholder="blur"
        blurDataURL="data:image/png;base64,..."
      />
      {/* 검색엔진이 브랜드명만이 아니라 서비스 문구까지 H1로 읽도록 두 줄을 한 H1에 담는다 */}
      <h1 className="text-center">
        <span className="font-advent block text-[40px] font-semibold! tracking-tight text-green-700">
          Peakda
        </span>
        <span className="text-text-secondary block font-sans text-base font-semibold tracking-tight">
          지금 이 순간 가장 예쁜 여행지
        </span>
      </h1>
    </div>
  )
}
