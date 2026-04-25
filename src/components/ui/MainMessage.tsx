import Image from 'next/image'

export default function MainMessage() {
  return (
    <div>
      <Image src={'/images/logo.png'} alt="로고" width={150} height={150} className="mx-auto" />
      <h1 className="font-advent text-center text-[44px] font-semibold text-green-700">Peakda</h1>
      <p className="text-center text-base font-semibold text-[#6B7280]">
        지금 이 순간 가장 예쁜 여행지
      </p>
    </div>
  )
}
