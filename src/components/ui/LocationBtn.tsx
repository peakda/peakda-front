import Image from 'next/image'
import IconBtn from './IconBtn'

export default function LocationBtn() {
  return (
    <IconBtn className="absolute right-4 bottom-24 z-10">
      <Image src={'./icons/location.svg'} alt="위치 초기화 버튼" width={24} height={24} />
    </IconBtn>
  )
}
