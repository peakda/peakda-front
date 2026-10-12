import { ChevronLeft, Link as LinkIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Header } from '@/components/ui/layout/Header'
import { StepperTab } from '@/components/ui/display/StepperTab'
import { Button } from '@/components/ui/button/Button'
import { Badge } from '@/components/ui/display/Badge'
import { Textarea } from '@/components/ui/form/Textarea'
import { Input } from '@/components/ui/form/Input'
import { ContentLinkCard } from '@/components/ui/card/ContentLinkCard'
import { classifyContentLink, normalizeContentLinkUrl } from '@/lib/utils/contentLink'
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
  // 기록 수정 화면도 같은 2단계 흐름을 쓴다. 헤더·버튼 문구만 수정용으로 바뀐다.
  isEdit?: boolean
  plants: PlantResponse[] | undefined
  selectedPlantIds: number[]
  onTogglePlant: (id: number) => void
  selectedStatus: BloomStage | ''
  onSelectStatus: (status: BloomStage) => void
  memo: string
  onMemoChange: (value: string) => void
  // 관련 콘텐츠 링크 입력값(정규화 전). 빈 문자열이면 링크 없음.
  contentLink: string
  onContentLinkChange: (value: string) => void
  isSubmitting: boolean
  onPublish: () => void
  plantDrawerOpen: boolean
  onPlantDrawerOpenChange: (open: boolean) => void
  onBack: () => void
}

export function DetailsStepForm({
  isEdit = false,
  plants,
  selectedPlantIds,
  onTogglePlant,
  selectedStatus,
  onSelectStatus,
  memo,
  onMemoChange,
  contentLink,
  onContentLinkChange,
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
  // 링크는 선택이지만, 서버가 400 으로 거절할 주소는 사진 업로드 전에 막는다.
  const normalizedLink = normalizeContentLinkUrl(contentLink)
  const isLinkInvalid = contentLink.trim() !== '' && !normalizedLink
  const isStep2Valid = selectedPlantIds.length > 0 && selectedStatus !== '' && !isLinkInvalid

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header
          left={
            <button type="button" aria-label="뒤로 가기" onClick={onBack}>
              <ChevronLeft size={24} />
            </button>
          }
          center={
            <span className="text-[15px] font-medium">{isEdit ? '기록 수정' : '스팟 기록'}</span>
          }
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

        {/* 관련 콘텐츠 링크 (SCR-018a) — 플랫폼은 붙여넣은 주소로 자동 분류한다 */}
        <div className="flex flex-col gap-3 px-5">
          <div className="flex flex-col gap-1">
            <p className="text-text-primary text-base leading-normal font-semibold tracking-[-0.005em]">
              관련 콘텐츠 링크{' '}
              <span className="text-text-tertiary text-sm font-medium tracking-normal">(선택)</span>
            </p>
            <p className="text-text-secondary text-sm leading-normal tracking-[0.005em]">
              블로그, 인스타그램, 유튜브 등 관련 콘텐츠를 연결해보세요.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="url"
              inputMode="url"
              autoCapitalize="off"
              autoComplete="off"
              variant="secondary"
              error={isLinkInvalid}
              value={contentLink}
              onChange={(e) => onContentLinkChange(e.target.value)}
              placeholder="콘텐츠 링크를 붙여넣어 주세요."
              aria-label="관련 콘텐츠 링크"
              leftIcon={<LinkIcon size={20} className="text-icon-secondary" />}
              className="text-text-secondary text-base"
            />
            {isLinkInvalid && (
              <p className="text-sm text-rose-500">올바른 링크 주소를 입력해 주세요.</p>
            )}
            {normalizedLink && (
              <ContentLinkCard
                url={normalizedLink}
                platform={classifyContentLink(normalizedLink)}
                onRemove={() => onContentLinkChange('')}
              />
            )}
          </div>
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
          {isEdit ? '수정 완료' : '게시하기'}
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
