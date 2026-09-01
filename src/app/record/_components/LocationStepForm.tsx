import type { Dispatch, SetStateAction } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Header } from '@/components/ui/layout/Header'
import { Drawer } from '@/components/ui/layout/Drawer'
import { StepperTab } from '@/components/ui/display/StepperTab'
import { SearchInput } from '@/app/search/_components/SearchInput'
import { Button } from '@/components/ui/button/Button'
import { DateSelect } from '@/components/ui/form/DateSelect'
import { LeftArrow } from '@/components/ui/button/LeftArrow'

export type Category = '유명명소' | '동네스팟'

export interface PhotoItem {
  file: File
  previewUrl: string
}

interface LocationStepFormProps {
  location: string
  hasLocation: boolean
  category: Category
  showCategoryPicker: boolean
  onToggleCategoryPicker: () => void
  onSelectCategory: (category: Category) => void
  onOpenSearch: () => void
  onLocationChange: Dispatch<SetStateAction<string>>
  photoItems: PhotoItem[]
  onPhotoAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: (index: number) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  date: string
  onDateChange: (value: string) => void
  isValid: boolean
  onNext: () => void
}

export function LocationStepForm({
  location,
  hasLocation,
  category,
  showCategoryPicker,
  onToggleCategoryPicker,
  onSelectCategory,
  onOpenSearch,
  onLocationChange,
  photoItems,
  onPhotoAdd,
  onRemovePhoto,
  fileInputRef,
  date,
  onDateChange,
  isValid,
  onNext,
}: LocationStepFormProps) {
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
                    onClick={() => onRemovePhoto(i)}
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
            onChange={onPhotoAdd}
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

        {/* 위치 */}
        <div className="flex flex-col gap-2">
          <p className="px-4 text-sm font-medium">
            위치 <span className="text-brand-primary">*</span>
          </p>
          {hasLocation ? (
            <div className="flex flex-col gap-2 px-4">
              <button
                onClick={onOpenSearch}
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
                  onClick={onToggleCategoryPicker}
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
                        onClick={() => onSelectCategory(c)}
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
              setQuery={onLocationChange}
              placeholder="주소 또는 장소명 검색"
              onFocus={onOpenSearch}
            />
          )}
        </div>

        {/* 촬영일자 */}
        <div className="flex flex-col gap-2 px-4">
          <p className="text-sm font-medium">
            촬영일자 <span className="text-brand-primary">*</span>
          </p>
          <DateSelect value={date} onChange={onDateChange} />
        </div>
      </div>

      <div className="p-4 pb-8">
        <Button variant="filled" color="primary" size="lg" disabled={!isValid} onClick={onNext}>
          다음
        </Button>
      </div>

      <Drawer />
    </div>
  )
}
