'use client'

import { useRef, useState } from 'react'
import { X, Plus, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import Header from '@/components/ui/layout/Header'
import StepperTab from '@/components/ui/display/StepperTab'
import SearchInput from '@/app/search/_components/SearchInput'
import Button from '@/components/ui/button/Button'
import DateSelect from '@/components/ui/form/DateSelect'
import { Badge } from '@/components/ui/display/Badge'

type Category = '유명명소' | '동네스팟'

interface LocationResult {
  id: number
  name: string
  address: string
  badge: string
}

interface PhotoItem {
  file: File
  previewUrl: string
}

const MOCK_RESULTS: LocationResult[] = [
  { id: 1, name: '장소명', address: '경상남도 창원시 진해구', badge: '동네스팟' },
  { id: 2, name: '장소명', address: '경상남도 창원시 진해구', badge: '유명장소' },
  { id: 3, name: '장소명', address: '경상남도 창원시 진해구', badge: '유명장소' },
  { id: 4, name: '장소명', address: '경상남도 창원시 진해구', badge: '유명장소' },
  { id: 5, name: '장소명', address: '경상남도 창원시 진해구', badge: '유명장소' },
  { id: 6, name: '장소명', address: '경상남도 창원시 진해구', badge: '유명장소' },
]

export default function RecordPage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<Category>('유명명소')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])
  const [date, setDate] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResult, setSelectedResult] = useState<LocationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasLocation = location.trim().length > 0
  const hasSearchQuery = searchQuery.trim().length > 0
  const isValid = hasLocation && photoItems.length > 0 && date.trim().length > 0

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

  const handleSelectLocation = () => {
    if (!selectedResult) return
    setLocation(selectedResult.name)
    setCategory(selectedResult.badge === '동네스팟' ? '동네스팟' : '유명명소')
    setShowCategoryPicker(false)
    setIsSearchMode(false)
    setSearchQuery('')
    setSelectedResult(null)
  }

  if (isSearchMode) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="h-14">
          <Header
            left={
              <button onClick={() => setIsSearchMode(false)}>
                <ChevronLeft size={24} />
              </button>
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
            {MOCK_RESULTS.map((result) => (
              <button
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3',
                  selectedResult?.id === result.id && 'bg-brand-secondary/10'
                )}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium text-text-primary">{result.name}</span>
                  <span className="text-xs text-text-tertiary">{result.address}</span>
                </div>
                <Badge
                  label={result.badge}
                  className={cn('bg-bg-primary', result.badge === '동네스팟' ? 'text-yellow-500' : 'text-green-400')}
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto p-4 pb-8">
          <Button
            variant="filled"
            color="primary"
            size="lg"
            disabled={!selectedResult}
            onClick={handleSelectLocation}
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
          left={
            <button onClick={() => router.back()}>
              <X size={24} />
            </button>
          }
          center={<span className="text-[15px] font-medium">스팟 기록</span>}
        />
      </div>

      <div className="px-4">
        <StepperTab currentStep={0} totalSteps={2} />
      </div>

      <div className="flex flex-1 flex-col gap-6 pt-6">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-xl font-semibold">어디에 있는 스팟인가요?</h2>
          <p className="text-sm text-text-tertiary">스팟의 위치와 사진, 다녀온 날짜를 알려주세요.</p>
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
                className="bg-bg-secondary border-border-secondary flex h-12 w-full items-center rounded-3xl border px-4 text-left text-base text-text-primary"
              >
                {location}
              </button>
              <div className="flex items-center justify-between p-1.5 rounded-2xl w-1/2 bg-green-50">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      category === '유명명소' ? 'bg-green-400' : 'bg-yellow-500'
                    )}
                  />
                  <span className="text-sm text-text-secondary">{category}로 인식</span>
                </div>
                <Button
                  onClick={() => setShowCategoryPicker((v) => !v)}
                  size='sm'
                  variant='outlined'
                  color='default'
                  className='bg-bg-primary px-4 py-2 text-sm text-text-secondary font-medium'
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
            <p className="text-xs text-text-secondary">최대 5장, 첫 사진이 대표 이미지</p>
          </div>
          {photoItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photoItems.map((item, i) => (
                <div key={i} className="bg-bg-secondary relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
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
              className="w-fit"
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
        <Button variant="filled" color="primary" size="lg" disabled={!isValid}>
          다음
        </Button>
      </div>
    </div>
  )
}
