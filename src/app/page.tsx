import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Image src={'/images/logo.png'} alt="로고" width={150} height={150} />
      <h1 className="font-advent text-[44px] font-semibold text-green-700">Peakda</h1>
      <p className="text-center text-base font-semibold text-[#6B7280]">
        지금 이 순간 가장 예쁜 여행지
      </p>
    </div>
  )
}
