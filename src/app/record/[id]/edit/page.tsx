'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import Button from '@/components/ui/button/Button'
import DateSelect from '@/components/ui/form/DateSelect'
import Textarea from '@/components/ui/form/Textarea'
import { Badge } from '@/components/ui/display/Badge'
import { PlantSelectDrawer } from '@/app/record/_components/PlantSelectDrawer'
import { usePlants } from '@/api/facades/plant'
import { useSpotRecord, useUpdateSpotRecord } from '@/api/facades/spot-record'
import type {
  SpotRecordResponse,
  UpdateSpotRecordRequest,
} from '@/api/generated/peakdaApi.schemas'

const PLANTS_DEFAULT_COUNT = 8

const STATUS_OPTIONS = [
  { label: '이르다', value: 'EARLY' },
  { label: '피기 시작', value: 'STARTING' },
  { label: '절정', value: 'PEAK' },
  { label: '늦었다', value: 'LATE' },
] as const

type BloomStage = (typeof STATUS_OPTIONS)[number]['value']

export default function RecordEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: record, isLoading } = useSpotRecord(Number(id))

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="h-14">
          <Header left={<LeftArrow />} center={<span className="text-[15px] font-medium">기록 수정</span>} />
        </div>
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="h-14">
          <Header left={<LeftArrow />} center={<span className="text-[15px] font-medium">기록 수정</span>} />
        </div>
        <p className="text-text-tertiary py-10 text-center text-sm">기록을 찾을 수 없어요</p>
      </div>
    )
  }

  // 데이터 로드 후 마운트되어 record 값으로 폼 상태를 초기화한다.
  return <RecordEditForm record={record} />
}

function RecordEditForm({ record }: { record: SpotRecordResponse }) {
  const router = useRouter()
  const { data: plants } = usePlants()
  const updateRecord = useUpdateSpotRecord()

  const [date, setDate] = useState(record.visitedDate ? record.visitedDate.replaceAll('-', '.') : '')
  const [selectedStatus, setSelectedStatus] = useState<BloomStage | ''>(record.bloomStage ?? '')
  const [memo, setMemo] = useState(record.memo ?? '')
  const [selectedPlantIds, setSelectedPlantIds] = useState<number[]>(record.plants.map((p) => p.id))
  const [plantDrawerOpen, setPlantDrawerOpen] = useState(false)

  const togglePlant = (plantId: number) =>
    setSelectedPlantIds((prev) =>
      prev.includes(plantId) ? prev.filter((p) => p !== plantId) : [...prev, plantId]
    )

  // 기본 노출 식물(앞 8개) + 목록 밖에서 선택된 식물(드로어에서 선택)을 함께 노출
  const basePlants = (plants ?? []).slice(0, PLANTS_DEFAULT_COUNT)
  const extraSelected = (plants ?? []).filter(
    (p) => selectedPlantIds.includes(p.id) && !basePlants.some((b) => b.id === p.id)
  )
  const visiblePlants = [...basePlants, ...extraSelected]

  const isValid = selectedPlantIds.length > 0 && selectedStatus !== ''

  // 사진은 수정 UI 범위 밖이라 photoKeys 를 보내지 않아 기존 사진을 유지한다.
  const handleSave = () => {
    if (!isValid) return
    const payload: UpdateSpotRecordRequest = {
      visitedDate: date ? date.replaceAll('.', '-') : null,
      bloomStage: selectedStatus,
      memo,
      plantIds: selectedPlantIds,
    }
    updateRecord.mutate(
      { id: record.id, data: payload },
      { onSuccess: () => router.push(`/record/${record.id}`) }
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header left={<LeftArrow />} center={<span className="text-[15px] font-medium">기록 수정</span>} />
      </div>

      <div className="flex flex-1 flex-col gap-6 pt-6 pb-8">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-text-primary text-xl font-semibold">{record.spot.name}</h2>
          <p className="text-text-secondary text-sm">식물 종류와 개화 상태, 메모를 수정할 수 있어요.</p>
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
                  onClick={() => togglePlant(plant.id)}
                />
              )
            })}
            <Badge
              label="더 많은 식물"
              leftIcon={<Plus size={12} />}
              variant="ghost"
              color="gray"
              className="cursor-pointer rounded-xl px-3.5 py-2"
              onClick={() => setPlantDrawerOpen(true)}
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
                onClick={() => setSelectedStatus(status.value)}
                className={cn('w-20 rounded-2xl px-2', selectedStatus === status.value && 'bg-green-50')}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 촬영일자 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">촬영일자</p>
          <DateSelect value={date} onChange={setDate} />
        </div>

        {/* 메모 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            메모 <span className="text-text-tertiary font-normal">(선택)</span>
          </p>
          <Textarea
            value={memo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMemo(e.target.value)}
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
          disabled={!isValid || updateRecord.isPending}
          onClick={handleSave}
        >
          수정 완료
        </Button>
      </div>

      <PlantSelectDrawer
        open={plantDrawerOpen}
        onOpenChange={setPlantDrawerOpen}
        plants={plants ?? []}
        selectedIds={selectedPlantIds}
        onToggle={togglePlant}
      />
    </div>
  )
}
