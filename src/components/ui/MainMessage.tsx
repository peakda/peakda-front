import Image from 'next/image'

export default function MainMessage() {
  return (
    <div>
      <Image
        src={'/images/logo.png'}
        alt="로고"
        width={128}
        height={120}
        className="mx-auto h-32 w-32"
      />
      <h1 className="font-advent text-color-green-700 text-center text-[40px] font-semibold! tracking-tight">
        Peakda
      </h1>
      <p className="text-var(--icon-secondary) text-center font-sans text-base font-semibold tracking-tight">
        지금 이 순간 가장 예쁜 여행지
      </p>
    </div>
  )
}
