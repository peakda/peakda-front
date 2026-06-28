'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Plus, ChevronLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import Header from '@/components/ui/layout/Header'
import StepperTab from '@/components/ui/display/StepperTab'
import SearchInput from '@/app/search/_components/SearchInput'
import Button from '@/components/ui/button/Button'
import DateSelect from '@/components/ui/form/DateSelect'
import { Badge } from '@/components/ui/display/Badge'
import Textarea from '@/components/ui/form/Textarea'
import { PlantSelectDrawer } from '@/app/record/_components/PlantSelectDrawer'
import { useKakaoPlaces, type KakaoPlace } from '@/hooks/useKakaoPlaces'
import { usePlants } from '@/api/facades/plant'
import { useMatchSpot } from '@/api/facades/spot'
import { useCreateSpotRecord, useUploadSpotRecordPhotos } from '@/api/facades/spot-record'
import type { CreateSpotRecordRequest } from '@/api/facades/generated/peakdaApi.schemas'
import LeftArrow from '@/components/ui/button/LeftArrow'

type Category = '유명명소' | '동네스팟'

interface PhotoItem {
  file: File
  previewUrl: string
}

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

const PLANTS_DEFAULT_COUNT = 8

const STATUS_OPTIONS = [
  { label: '이르다', value: 'EARLY' },
  { label: '피기 시작', value: 'STARTING' },
  { label: '절정', value: 'PEAK' },
  { label: '늦었다', value: 'LATE' },
] as const

type BloomStage = (typeof STATUS_OPTIONS)[number]['value']

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
      <div className="flex min-h-screen flex-col bg-white">
        <div className="h-14">
          <Header center={<span className="text-[15px] font-medium">스팟 기록</span>} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <Check size={36} className="text-brand-secondary" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">기록이 등록되었어요!</h2>
            <p className="text-text-tertiary text-sm">지도 속 타이밍에 반영해보아요</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 pb-8">
          <Button variant="filled" color="primary" size="lg" onClick={() => router.push('/map')}>
            지도로 확인하기
          </Button>
          <Button variant="outlined" color="primary" size="lg" onClick={handleRecordAgain}>
            계속 기록하기
          </Button>
          <Button variant="ghost" color="default" size="lg" onClick={() => router.back()}>
            종료
          </Button>
        </div>
      </div>
    )
  }

  if (step === 1) {
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
              <button onClick={() => setStep(0)}>
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
            disabled={!isStep2Valid || isSubmitting}
            onClick={handlePublish}
          >
            게시하기
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

  if (isSearchMode) {
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
                onClick={() => setIsSearchMode(false)}
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
            setQuery={setSearchQuery}
            placeholder="주소 또는 장소명 검색"
          />
        </div>

        {hasSearchQuery && (
          <div className="flex-1 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => setSelectedPlace(result)}
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
            disabled={!selectedPlace || matchSpot.isPending}
            onClick={handleSelectPlace}
          >
            선택
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<span className="text-[15px] font-medium">스팟 기록</span>}
        />
      </div>

      <div className="px-4">
        <StepperTab currentStep={0} totalSteps={2} />
      </div>

      <div className="flex flex-1 flex-col gap-6 pt-6">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-xl font-semibold">어디에 있는 스팟인가요?</h2>
          <p className="text-text-tertiary text-sm">
            스팟의 위치와 사진, 다녀온 날짜를 알려주세요.
          </p>
        </div>

        {/* 위치 */}
        <div className="flex flex-col gap-2">
          <p className="px-4 text-sm font-medium">
            위치 <span className="text-brand-primary">*</span>
          </p>
          {hasLocation ? (
            <div className="flex flex-col gap-2 px-4">
              <button
                onClick={() => setIsSearchMode(true)}
                className="bg-bg-secondary border-border-secondary text-text-primary flex h-12 w-full items-center rounded-3xl border px-4 text-left text-base"
              >
                {location}
              </button>
              <div className="flex w-1/2 items-center justify-between rounded-2xl bg-green-50 p-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      category === '유명명소' ? 'bg-green-400' : 'bg-yellow-500'
                    )}
                  />
                  <span className="text-text-secondary text-sm">{category}로 인식</span>
                </div>
                <Button
                  onClick={() => setShowCategoryPicker((v) => !v)}
                  size="sm"
                  variant="outlined"
                  color="default"
                  className="bg-bg-primary text-text-secondary px-4 py-2 text-sm font-medium"
                >
                  변경
                </Button>
              </div>
              {showCategoryPicker && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">분류</p>
                  <div className="flex gap-2">
                    {(['유명명소', '동네스팟'] as Category[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={cn(
                          'flex-1 rounded-3xl border py-2.5 text-sm font-medium transition-colors',
                          category === c
                            ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                            : 'border-border-secondary text-text-secondary'
                        )}
                      >
                        {c === '유명명소' ? '유명 명소' : '동네 스팟'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SearchInput
              query={location}
              hasQuery={hasLocation}
              setQuery={setLocation}
              placeholder="주소 또는 장소명 검색"
              onFocus={() => setIsSearchMode(true)}
            />
          )}
        </div>

        {/* 사진 */}
        <div className="flex flex-col gap-2 px-4">
          <div>
            <p className="text-sm font-medium">
              사진 <span className="text-brand-primary">*</span>
            </p>
            <p className="text-text-secondary text-xs">최대 5장, 첫 사진이 대표 이미지</p>
          </div>
          {photoItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photoItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-bg-secondary relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={`사진 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoAdd}
          />
          {photoItems.length < 5 && (
            <Button
              variant="outlined"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => fileInputRef.current?.click()}
              className="w-fit rounded-2xl py-5"
            >
              사진 추가
            </Button>
          )}
        </div>

        {/* 촬영일자 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            촬영일자 <span className="text-brand-primary">*</span>
          </p>
          <DateSelect value={date} onChange={setDate} />
        </div>
      </div>

      <div className="p-4 pb-8">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          disabled={!isValid}
          onClick={() => setStep(1)}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
