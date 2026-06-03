'use client'

import { useEffect, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/display/Badge'
import Button from '@/components/ui/button/Button'
import SearchInput from '@/app/search/_components/SearchInput'
import { useSearchPlants, useSuggestPlant } from '@/api/facades/plant'
import type { PlantResponse } from '@/api/generated/peakdaApi.schemas'

interface PlantSelectDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plants: PlantResponse[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

export function PlantSelectDrawer({
  open,
  onOpenChange,
  plants,
  selectedIds,
  onToggle,
}: PlantSelectDrawerProps) {
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searched, isFetching } = useSearchPlants(keyword)
  const suggestPlant = useSuggestPlant()

  // 검색어가 있으면 검색 결과, 없으면 전체 식물 목록
  const visiblePlants = keyword ? (searched ?? []) : plants
  const noResults = keyword.length > 0 && !isFetching && (searched?.length ?? 0) === 0
  const selectedPlants = plants.filter((p) => selectedIds.includes(p.id))

  // 검색 결과에 없는 식물을 직접 추가 → 추가 즉시 선택
  const handleSuggest = async () => {
    if (!keyword) return
    try {
      const created = await suggestPlant.mutateAsync({ data: { name: keyword } })
      const newPlant = created.data.data
      if (newPlant) onToggle(newPlant.id)
      setQuery('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/30" />

        <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-100 mx-auto flex max-h-[85vh] max-w-[430px] flex-col rounded-t-[20px] bg-white outline-none">
          <VaulDrawer.Title className="sr-only">식물 선택</VaulDrawer.Title>

          <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />

          <h2 className="px-4 pt-2 text-lg font-semibold">식물 선택</h2>

          <SearchInput
            query={query}
            hasQuery={query.trim().length > 0}
            setQuery={setQuery}
            placeholder="식물 이름으로 검색"
          />

          {/* 선택된 식물 */}
          {selectedPlants.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2" data-vaul-no-drag>
              {selectedPlants.map((plant) => (
                <Badge
                  key={plant.id}
                  label={plant.name}
                  rightIcon={<X size={12} />}
                  variant="filled"
                  color="green"
                  className="cursor-pointer rounded-xl px-3 py-1.5"
                  onClick={() => onToggle(plant.id)}
                />
              ))}
            </div>
          )}

          <div
            className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4"
            data-vaul-no-drag
            onPointerDown={(e) => e.stopPropagation()}
          >
            {noResults ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex flex-col gap-1">
                  <p className="text-text-secondary text-sm font-medium">
                    아직 항목에 없는 식물이네요
                  </p>
                  <p className="text-text-tertiary text-xs">직접 등록해서 추가할 수 있어요</p>
                </div>
                <Button
                  variant="outlined"
                  color="primary"
                  size="md"
                  leftIcon={<Plus size={16} />}
                  disabled={suggestPlant.isPending}
                  onClick={handleSuggest}
                >
                  &apos;{keyword}&apos; 직접 추가하기
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visiblePlants.map((plant) => {
                  const isSelected = selectedIds.includes(plant.id)
                  return (
                    <Badge
                      key={plant.id}
                      label={plant.name}
                      variant="ghost"
                      color="gray"
                      className={cn(
                        'cursor-pointer rounded-xl px-3.5 py-2',
                        isSelected && 'border-brand-secondary text-text-secondary bg-green-50'
                      )}
                      onClick={() => onToggle(plant.id)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-4 pb-8">
            <Button
              variant="filled"
              color="primary"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              선택 완료
            </Button>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
