'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useKakaoPlaces, type KakaoPlace } from '@/hooks/useKakaoPlaces'
import { usePlants } from '@/api/facades/plant'
import { useMatchSpot } from '@/api/facades/spot'
import { useCreateSpotRecord, useUploadSpotRecordPhotos } from '@/api/facades/spot-record'
import type { CreateSpotRecordRequest } from '@/api/facades/generated/peakdaApi.schemas'
import { LocationStepForm, type Category, type PhotoItem } from '@/app/record/_components/LocationStepForm'
import { DetailsStepForm, type BloomStage } from '@/app/record/_components/DetailsStepForm'
import { LocationSearchView } from '@/app/record/_components/LocationSearchView'
import { RecordCompleteView } from '@/app/record/_components/RecordCompleteView'

// 매칭/생성에 필요한 스팟 정보 (카카오 검색 + 스팟 매칭 결과)
interface SelectedSpot {
  name: string
  address: string | null
  latitude: number
  longitude: number
  kakaoPlaceId: string
  existingSpotId: number | null
  attractionId: number | null
}

export default function RecordPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [location, setLocation] = useState('')
  const [selectedSpot, setSelectedSpot] = useState<SelectedSpot | null>(null)
  const [category, setCategory] = useState<Category>('유명명소')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])
  const [date, setDate] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPlantIds, setSelectedPlantIds] = useState<number[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BloomStage | ''>('')
  const [memo, setMemo] = useState('')
  const [plantDrawerOpen, setPlantDrawerOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const { results, search } = useKakaoPlaces()
  const { data: plants } = usePlants()
  const matchSpot = useMatchSpot()
  const uploadPhotos = useUploadSpotRecordPhotos()
  const createRecord = useCreateSpotRecord()

  // 검색어 변경 시 카카오 장소 검색 (디바운스)
  useEffect(() => {
    if (!isSearchMode) return
    const timer = setTimeout(() => search(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, isSearchMode, search])

  const togglePlant = (id: number) =>
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )

  const hasLocation = location.trim().length > 0
  const hasSearchQuery = searchQuery.trim().length > 0
  const isValid = hasLocation && photoItems.length > 0
  const isSubmitting = matchSpot.isPending || uploadPhotos.isPending || createRecord.isPending

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newItems = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    setPhotoItems((prev) => [...prev, ...newItems].slice(0, 5))
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    setPhotoItems((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  // 카카오 장소 선택 → 좌표 기반 스팟 매칭 → 제안 분류로 카테고리 초기화
  const handleSelectPlace = async () => {
    if (!selectedPlace) return

    const latitude = Number(selectedPlace.y)
    const longitude = Number(selectedPlace.x)
    const address = selectedPlace.road_address_name || selectedPlace.address_name || null

    try {
      const matchRes = await matchSpot.mutateAsync({
        data: {
          latitude,
          longitude,
          name: selectedPlace.place_name,
          address,
          kakaoPlaceId: selectedPlace.id,
        },
      })
      const matchData = matchRes.data.data
      const suggestedType = matchData?.suggestedType ?? 'LOCAL'

      setSelectedSpot({
        name: selectedPlace.place_name,
        address,
        latitude,
        longitude,
        kakaoPlaceId: selectedPlace.id,
        existingSpotId: matchData?.spot?.id ?? null,
        attractionId: matchData?.spot?.attractionId ?? null,
      })
      setLocation(selectedPlace.place_name)
      setCategory(suggestedType === 'ATTRACTION' ? '유명명소' : '동네스팟')
    } catch (err) {
      console.error(err)
      return
    }

    setShowCategoryPicker(false)
    setIsSearchMode(false)
    setSearchQuery('')
    setSelectedPlace(null)
  }

  // 사진 업로드 → photoKeys 확보 → PUBLISHED 기록 생성
  const handlePublish = async () => {
    if (!selectedSpot || selectedStatus === '') return

    try {
      const photoKeys: string[] = []
      for (const item of photoItems) {
        const res = await uploadPhotos.mutateAsync({ data: { images: item.file } })
        const key = res.data.data?.photos[0]?.objectKey
        if (key) photoKeys.push(key)
      }

      const payload: CreateSpotRecordRequest = {
        spotInput: {
          existingSpotId: selectedSpot.existingSpotId,
          type: category === '유명명소' ? 'ATTRACTION' : 'LOCAL',
          attractionId: selectedSpot.attractionId,
          name: selectedSpot.name,
          address: selectedSpot.address,
          latitude: selectedSpot.latitude,
          longitude: selectedSpot.longitude,
          kakaoPlaceId: selectedSpot.kakaoPlaceId,
        },
        visitedDate: date ? date.replaceAll('.', '-') : null,
        bloomStage: selectedStatus,
        memo: memo.trim() || null,
        plantIds: selectedPlantIds,
        photoKeys,
        status: 'PUBLISHED',
      }

      await createRecord.mutateAsync({ data: payload })
      setIsComplete(true)
    } catch (err) {
      console.error(err)
    }
  }

  // 완료 화면 → "계속 기록하기": 입력값을 모두 초기화하고 Step1로 복귀
  const handleRecordAgain = () => {
    photoItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setStep(0)
    setLocation('')
    setSelectedSpot(null)
    setCategory('유명명소')
    setShowCategoryPicker(false)
    setPhotoItems([])
    setDate('')
    setIsSearchMode(false)
    setSearchQuery('')
    setSelectedPlace(null)
    setSelectedPlantIds([])
    setSelectedStatus('')
    setMemo('')
    setPlantDrawerOpen(false)
    setIsComplete(false)
  }

  if (isComplete) {
    return (
      <RecordCompleteView
        onGoToMap={() => router.push('/map')}
        onRecordAgain={handleRecordAgain}
        onExit={() => router.back()}
      />
    )
  }

  if (step === 1) {
    return (
      <DetailsStepForm
        plants={plants ?? undefined}
        selectedPlantIds={selectedPlantIds}
        onTogglePlant={togglePlant}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        memo={memo}
        onMemoChange={setMemo}
        isSubmitting={isSubmitting}
        onPublish={handlePublish}
        plantDrawerOpen={plantDrawerOpen}
        onPlantDrawerOpenChange={setPlantDrawerOpen}
        onBack={() => setStep(0)}
      />
    )
  }

  if (isSearchMode) {
    return (
      <LocationSearchView
        searchQuery={searchQuery}
        hasSearchQuery={hasSearchQuery}
        onSearchQueryChange={setSearchQuery}
        results={results}
        selectedPlace={selectedPlace}
        onSelectPlace={setSelectedPlace}
        onConfirm={handleSelectPlace}
        isConfirming={matchSpot.isPending}
        onClose={() => setIsSearchMode(false)}
      />
    )
  }

  return (
    <LocationStepForm
      location={location}
      hasLocation={hasLocation}
      category={category}
      showCategoryPicker={showCategoryPicker}
      onToggleCategoryPicker={() => setShowCategoryPicker((v) => !v)}
      onSelectCategory={setCategory}
      onOpenSearch={() => setIsSearchMode(true)}
      onLocationChange={setLocation}
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
