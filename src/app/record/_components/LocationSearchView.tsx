import type { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { Header } from '@/components/ui/layout/Header'
import { SearchInput } from '@/app/search/_components/SearchInput'
import { Button } from '@/components/ui/button/Button'
import type { KakaoPlace } from '@/hooks/useKakaoPlaces'

export type LocationSearchState =
  | 'sdk-loading'
  | 'search-loading'
  | 'results'
  | 'empty'
  | 'error'
  | 'sdk-error'

interface LocationSearchViewProps {
  searchQuery: string
  hasSearchQuery: boolean
  onSearchQueryChange: Dispatch<SetStateAction<string>>
  results: KakaoPlace[]
  searchState: LocationSearchState
  onRetry: () => void
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
  searchState,
  onRetry,
  selectedPlace,
  onSelectPlace,
  onConfirm,
  isConfirming,
  onClose,
}: LocationSearchViewProps) {
  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="h-14 shrink-0">
        <Header
          left={
            <button
              type="button"
              aria-label="뒤로 가기"
              className="-m-3 flex cursor-pointer p-3"
              onClick={onClose}
            >
              <Image src="/icons/LeftArrow.svg" alt="" className="h-6 w-6" width={24} height={24} />
            </button>
          }
          center={<span className="text-[15px] font-medium">위치 검색</span>}
        />
      </div>

      <div className="flex shrink-0 flex-col gap-2">
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

      {hasSearchQuery && searchState === 'results' && (
        <div className="min-h-0 flex-1 overflow-y-auto">
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

      {hasSearchQuery && searchState !== 'results' && (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center"
          role={searchState === 'error' || searchState === 'sdk-error' ? 'alert' : 'status'}
        >
          {(searchState === 'sdk-loading' || searchState === 'search-loading') && (
            <span
              aria-hidden="true"
              className="border-brand-secondary mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent motion-reduce:animate-none"
            />
          )}
          <p className="text-text-primary text-base font-semibold">
            {searchState === 'sdk-loading'
              ? '위치 검색을 준비하고 있어요'
              : searchState === 'search-loading'
                ? '장소를 찾고 있어요'
                : searchState === 'empty'
                  ? '검색 결과가 없어요'
                  : searchState === 'sdk-error'
                    ? '위치 검색을 시작하지 못했어요'
                    : '장소를 불러오지 못했어요'}
          </p>
          {searchState === 'empty' && (
            <p className="text-text-tertiary text-sm">장소명이나 주소를 다르게 입력해 보세요</p>
          )}
          {(searchState === 'error' || searchState === 'sdk-error') && (
            <>
              <p className="text-text-tertiary text-sm">연결 상태를 확인하고 다시 시도해 주세요</p>
              <button
                type="button"
                onClick={onRetry}
                className="border-border-primary mt-2 rounded-xl border px-4 py-2 text-sm font-medium"
              >
                다시 시도
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-auto shrink-0 p-4 pb-8">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          disabled={!selectedPlace || isConfirming || searchState !== 'results'}
          onClick={onConfirm}
        >
          선택
        </Button>
      </div>
    </div>
  )
}
