import { ChevronLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Header from '@/components/ui/layout/Header'
import StepperTab from '@/components/ui/display/StepperTab'
import Button from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import Textarea from '@/components/ui/form/Textarea'
import { PlantSelectDrawer } from '@/app/record/_components/PlantSelectDrawer'
import type { PlantResponse } from '@/api/facades/generated/peakdaApi.schemas'

const PLANTS_DEFAULT_COUNT = 8

export const STATUS_OPTIONS = [
  { label: '이르다', value: 'EARLY' },
  { label: '피기 시작', value: 'STARTING' },
  { label: '절정', value: 'PEAK' },
  { label: '늦었다', value: 'LATE' },
] as const

export type BloomStage = (typeof STATUS_OPTIONS)[number]['value']

interface DetailsStepFormProps {
  plants: PlantResponse[] | undefined
  selectedPlantIds: number[]
  onTogglePlant: (id: number) => void
  selectedStatus: BloomStage | ''
  onSelectStatus: (status: BloomStage) => void
  memo: string
  onMemoChange: (value: string) => void
  isSubmitting: boolean
  onPublish: () => void
  plantDrawerOpen: boolean
  onPlantDrawerOpenChange: (open: boolean) => void
  onBack: () => void
}

export function DetailsStepForm({
  plants,
  selectedPlantIds,
  onTogglePlant,
  selectedStatus,
  onSelectStatus,
  memo,
  onMemoChange,
  isSubmitting,
  onPublish,
  plantDrawerOpen,
  onPlantDrawerOpenChange,
  onBack,
}: DetailsStepFormProps) {
  // 기본 노출 식물(앞 8개) + 그 밖에서 선택된 식물(드로어에서 선택/추가)을 함께 노출
  const basePlants = (plants ?? []).slice(0, PLANTS_DEFAULT_COUNT)
  const extraSelected = (plants ?? []).filter(
    (p) => selectedPlantIds.includes(p.id) && !basePlants.some((b) => b.id === p.id)
  )
  const visiblePlants = [...basePlants, ...extraSelected]
  const isStep2Valid = selectedPlantIds.length > 0 && selectedStatus !== ''

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header
          left={
            <button onClick={onBack}>
              <ChevronLeft size={24} />
            </button>
          }
          center={<span className="text-[15px] font-medium">스팟 기록</span>}
        />
      </div>

      <div className="px-4">
        <StepperTab currentStep={1} totalSteps={2} />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto pt-6 pb-8">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-text-primary text-xl font-semibold">이 스팟의 모습은 어땠나요?</h2>
          <p className="text-text-secondary text-sm">
            식물 종류와 개화 상태, 그날의 추억을 들려주세요.
          </p>
        </div>

        {/* 식물 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            식물 <span className="text-brand-primary">*</span>
            <span className="text-text-tertiary ml-1 font-normal">복수선택 가능</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {visiblePlants.map((plant) => {
              const isSelected = selectedPlantIds.includes(plant.id)
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
                  onClick={() => onTogglePlant(plant.id)}
                />
              )
            })}
            <Badge
              label="더 많은 식물"
              leftIcon={<Plus size={12} />}
              variant="ghost"
              color="gray"
              className="cursor-pointer rounded-xl px-3.5 py-2"
              onClick={() => onPlantDrawerOpenChange(true)}
            />
          </div>
        </div>

        {/* 상태 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            상태 <span className="text-brand-primary">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status.value}
                variant="outlined"
                color={selectedStatus === status.value ? 'primary' : 'default'}
                size="md"
                onClick={() => onSelectStatus(status.value)}
                className={cn(
                  'w-20 rounded-2xl px-2',
                  selectedStatus === status.value && 'bg-green-50'
                )}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            메모 <span className="text-text-tertiary font-normal">(선택)</span>
          </p>
          <Textarea
            value={memo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onMemoChange(e.target.value)}
            placeholder="해당 장소에 대한 추억과 풍경을 작성해주세요."
            rows={5}
            variant="none"
          />
        </div>
      </div>

      <div className="p-4 pb-8">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          disabled={!isStep2Valid || isSubmitting}
          onClick={onPublish}
        >
          게시하기
        </Button>
      </div>

      <PlantSelectDrawer
        open={plantDrawerOpen}
        onOpenChange={onPlantDrawerOpenChange}
        plants={plants ?? []}
        selectedIds={selectedPlantIds}
        onToggle={onTogglePlant}
      />
    </div>
  )
}
