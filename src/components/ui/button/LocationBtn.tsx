import Image from 'next/image'
import IconBtn from './IconBtn'

interface LocationBtnProps {
  onLocate?: () => void
  style?: React.CSSProperties
}

export default function LocationBtn({ onLocate, style }: LocationBtnProps) {
  return (
    <button
      type="button"
      onClick={onLocate}
      aria-label="내 위치로 이동"
      className="absolute right-4 bottom-24 z-10"
      style={style}
    >
      <IconBtn>
        <Image src={'./icons/location.svg'} alt="위치 초기화 버튼" width={24} height={24} />
      </IconBtn>
    </button>
  )
}
