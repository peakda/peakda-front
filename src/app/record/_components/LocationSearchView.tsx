import type { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { Header } from '@/components/ui/layout/Header'
import { SearchInput } from '@/app/search/_components/SearchInput'
import { Button } from '@/components/ui/button/Button'
import type { KakaoPlace } from '@/hooks/useKakaoPlaces'

interface LocationSearchViewProps {
  searchQuery: string
  hasSearchQuery: boolean
  onSearchQueryChange: Dispatch<SetStateAction<string>>
  results: KakaoPlace[]
  selectedPlace: KakaoPlace | null
  onSelectPlace: (place: KakaoPlace) => void
  onConfirm: () => void
  isConfirming: boolean
  onClose: () => void
}

export function LocationSearchView({
  searchQuery,
  hasSearchQuery,
  onSearchQueryChange,
  results,
  selectedPlace,
  onSelectPlace,
  onConfirm,
  isConfirming,
  onClose,
}: LocationSearchViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header
          left={
            <Image
              src={'../icons/LeftArrow.svg'}
              alt="왼쪽 화살표"
              className="h-6 w-6 cursor-pointer"
              width={24}
              height={24}
              onClick={onClose}
            />
          }
          center={<span className="text-[15px] font-medium">위치 검색</span>}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="px-4 text-sm font-medium">
          위치 <span className="text-brand-primary">*</span>
        </p>
        <SearchInput
          query={searchQuery}
          hasQuery={hasSearchQuery}
          setQuery={onSearchQueryChange}
          placeholder="주소 또는 장소명 검색"
        />
      </div>

      {hasSearchQuery && (
        <div className="flex-1 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onSelectPlace(result)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3',
                selectedPlace?.id === result.id && 'bg-brand-secondary/10'
              )}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-text-primary text-sm font-medium">{result.place_name}</span>
                <span className="text-text-tertiary text-xs">
                  {result.road_address_name || result.address_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-auto p-4 pb-8">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          disabled={!selectedPlace || isConfirming}
          onClick={onConfirm}
        >
          선택
        </Button>
      </div>
    </div>
  )
}
