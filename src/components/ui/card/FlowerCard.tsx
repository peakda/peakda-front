import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

interface FlowerCardProps {
  label: string
  date: string
  image: string
  selected?: boolean
  onClick?: () => void
}

export default function FlowerCard({
  label,
  date,
  image,
  selected = false,
  onClick,
}: FlowerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-border-primary flex min-h-[90px] min-w-[60px] flex-col items-center justify-center gap-1 rounded-lg border p-3',
        selected && 'border-primary bg-pink-50'
      )}
    >
      <Image src={image} alt={label} width={24} height={24} />
      <p className="text-text-primary text-sm">{label}</p>
      <p className="text-text-tertiary text-[13px]">{date}</p>
    </div>
  )
}
