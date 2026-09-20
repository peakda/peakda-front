'use client'

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { LocationStepForm } from '@/app/record/_components/LocationStepForm'
import { DetailsStepForm, type BloomStage } from '@/app/record/_components/DetailsStepForm'
import { RecordSkeleton } from '@/app/record/_components/RecordSkeleton'
import { usePlants } from '@/api/facades/plant'
import {
  useSpotRecord,
  useUpdateSpotRecord,
  useUploadSpotRecordPhotos,
} from '@/api/facades/spot-record'
import { compressImage } from '@/lib/utils/image'
import type {
  SpotRecordResponse,
  UpdateSpotRecordRequest,
} from '@/api/facades/generated/peakdaApi.schemas'

// 수정 화면의 사진은 두 종류가 섞인다. 이미 올라가 objectKey 를 가진 사진과, 이번에 골라
// 아직 업로드하지 않은 파일. 저장할 때 화면에 보이는 순서 그대로 photoKeys 를 만든다.
type EditPhoto =
  | { kind: 'existing'; objectKey: string; previewUrl: string }
  | { kind: 'new'; file: File; previewUrl: string }

export default function RecordEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: record, isLoading } = useSpotRecord(Number(id))

  if (isLoading) return <RecordSkeleton />

  if (!record) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="h-14">
          <Header
            left={<LeftArrow />}
            center={<span className="text-[15px] font-medium">기록 수정</span>}
          />
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
  const uploadPhotos = useUploadSpotRecordPhotos()
  const updateRecord = useUpdateSpotRecord()

  const [step, setStep] = useState(0)
  const [photoItems, setPhotoItems] = useState<EditPhoto[]>(() =>
    record.photos.map((photo) => ({
      kind: 'existing',
      objectKey: photo.objectKey,
      previewUrl: photo.url,
    }))
  )
  const [date, setDate] = useState(
    record.visitedDate ? record.visitedDate.replaceAll('-', '.') : ''
  )
  const [selectedStatus, setSelectedStatus] = useState<BloomStage | ''>(record.bloomStage ?? '')
  const [memo, setMemo] = useState(record.memo ?? '')
  const [selectedPlantIds, setSelectedPlantIds] = useState<number[]>(record.plants.map((p) => p.id))
  const [plantDrawerOpen, setPlantDrawerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValid = photoItems.length > 0 && date.trim().length > 0
  const isSubmitting = uploadPhotos.isPending || updateRecord.isPending

  const togglePlant = (plantId: number) =>
    setSelectedPlantIds((prev) =>
      prev.includes(plantId) ? prev.filter((p) => p !== plantId) : [...prev, plantId]
    )

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    // 미리보기도 업로드에 쓸 파일 그대로 보여 준다(원본 수 MB 를 메모리에 들고 있지 않도록).
    const compressed = await Promise.all(files.map(compressImage))
    const newItems = compressed.map(
      (file): EditPhoto => ({ kind: 'new', file, previewUrl: URL.createObjectURL(file) })
    )
    setPhotoItems((prev) => [...prev, ...newItems].slice(0, 5))
  }

  const handleRemovePhoto = (index: number) => {
    setPhotoItems((prev) => {
      // 서버 url 은 revoke 대상이 아니다. 뺀 기존 사진은 photoKeys 에서 빠지고 서버가 정리한다.
      const target = prev[index]
      if (target.kind === 'new') URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  // 새로 고른 사진만 업로드 → 화면 순서대로 photoKeys 조립 → 기록 수정
  const handleSave = async () => {
    if (!isValid || selectedStatus === '') return

    try {
      const newFiles = photoItems.flatMap((item) => (item.kind === 'new' ? [item.file] : []))
      let uploadedKeys: string[] = []

      if (newFiles.length > 0) {
        // 작성 화면과 같이 한 요청에 모아 올린다(업로드 순서 = 응답 순서).
        const res = await uploadPhotos.mutateAsync({ data: { images: newFiles } })
        uploadedKeys = (res.data.data?.photos ?? []).map((photo) => photo.objectKey)
        // 한 장이라도 키를 못 받으면 사진이 빠진 채 수정되므로 전체를 중단한다.
        if (uploadedKeys.length !== newFiles.length) {
          throw new Error('사진 업로드 응답의 개수가 요청과 다릅니다')
        }
      }

      let uploadedIndex = 0
      const photoKeys = photoItems.map((item) =>
        item.kind === 'existing' ? item.objectKey : uploadedKeys[uploadedIndex++]
      )

      // photoKeys 는 전체 교체다 — 빠진 key 의 사진은 서버가 지운다.
      const payload: UpdateSpotRecordRequest = {
        visitedDate: date ? date.replaceAll('.', '-') : null,
        bloomStage: selectedStatus,
        memo,
        plantIds: selectedPlantIds,
        photoKeys,
      }

      await updateRecord.mutateAsync({ id: record.id, data: payload })
      router.push(`/record/${record.id}`)
    } catch (err) {
      console.error(err)
      toast.error('기록 수정에 실패했어요')
    }
  }

  if (step === 1) {
    return (
      <DetailsStepForm
        isEdit
        plants={plants ?? undefined}
        selectedPlantIds={selectedPlantIds}
        onTogglePlant={togglePlant}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        memo={memo}
        onMemoChange={setMemo}
        isSubmitting={isSubmitting}
        onPublish={handleSave}
        plantDrawerOpen={plantDrawerOpen}
        onPlantDrawerOpenChange={setPlantDrawerOpen}
        onBack={() => setStep(0)}
      />
    )
  }

  return (
    <LocationStepForm
      isEdit
      location={record.spot.name}
      category={record.spot.type === 'ATTRACTION' ? '유명명소' : '동네스팟'}
      photoItems={photoItems}
      onPhotoAdd={handlePhotoAdd}
      onRemovePhoto={handleRemovePhoto}
      fileInputRef={fileInputRef}
      date={date}
      onDateChange={setDate}
      isValid={isValid}
      onNext={() => setStep(1)}
    />
  )
}
