import { cn } from '@/lib/utils/cn'

interface Props {
  scrollSnaps: number[]
  selectedIndex: number
  scrollTo: (index: number) => void
}

export default function Indecator({ scrollSnaps, selectedIndex, scrollTo }: Props) {
  return (
    <div role="tablist" aria-label="온보딩 단계" className="flex items-center gap-2">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          role="tab"
          aria-selected={index === selectedIndex}
          aria-label={`${index + 1}단계`}
          onClick={() => scrollTo(index)}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            index === selectedIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'
          )}
        />
      ))}
    </div>
  )
}
