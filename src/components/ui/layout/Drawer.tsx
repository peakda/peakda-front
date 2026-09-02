'use client'

import { Drawer as VaulDrawer } from 'vaul'
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { Button } from '@/components/ui/button/Button'
import { FilterDrawerContent } from './FilterDrawerContent'
import { LogoutDrawerContent } from './LogoutDrawerContent'
import { WithdrawDrawerContent } from './WithdrawDrawerContent'
import { SaveSpotDrawerContent } from './SaveSpotDrawerContent'
import { DateSelectDrawerContent } from './DateSelectDrawerContent'
import { DeleteConfirmDrawerContent } from './DeleteConfirmDrawerContent'
import { PinList } from '@/components/ui/display/PinList'
import { useFilterStore } from '@/stores/useFilterStore'
import { spotPreviewApi } from '@/api/facades/spot'
import { toPinListItems } from '@/lib/utils/spotPreview'
import { timingToStatus } from '@/lib/utils/timing'
import { toast } from 'sonner'

// 닫힘 애니메이션이 끝난 뒤 목록 드로어를 띄우기 위한 대기 시간(vaul 슬라이드 아웃 기준).
const DRAWER_CLOSE_MS = 350

export function Drawer() {
  // snapHeight 는 여기서 쓰지 않는다 — 전체 구독하면 스냅 변경마다 드로어 전체가 다시 그려진다.
  const {
    isOpen,
    type,
    pinListData,
    saveSpotData,
    dateSelectData,
    deleteConfirmData,
    closeDrawer,
    setSnapHeight,
    openPinDrawer,
  } = useDrawerStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      type: s.type,
      pinListData: s.pinListData,
      saveSpotData: s.saveSpotData,
      dateSelectData: s.dateSelectData,
      deleteConfirmData: s.deleteConfirmData,
      closeDrawer: s.closeDrawer,
      setSnapHeight: s.setSnapHeight,
      openPinDrawer: s.openPinDrawer,
    }))
  )
  const router = useRouter()
  const [snap, setSnap] = useState<string | number | null>('400px')

  // 지도가 올려주는 "현재 화면의 필터 결과" — 필터 모드 하단 버튼이 쓴다.
  const visibleSpotIds = useFilterStore((s) => s.visibleSpotIds)
  const mapCenter = useFilterStore((s) => s.mapCenter)
  const isVisibleStale = useFilterStore((s) => s.isVisibleStale)
  const draftVisibleCount = useFilterStore((s) => s.draftVisibleCount)
  const applied = useFilterStore((s) => s.applied)
  const visibleAppliedFor = useFilterStore((s) => s.visibleAppliedFor)
  const applyDraft = useFilterStore((s) => s.applyDraft)
  const syncDraft = useFilterStore((s) => s.syncDraft)

  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  // 버튼을 눌러 필터를 적용한 뒤, 지도 조회가 끝나면 목록을 연다.
  const [isPendingList, setIsPendingList] = useState(false)
  const [activeTab, setActiveTab] = useState('region')

  const isFilterMode = type === 'filter' || type === 'flower-filter'
  // 꽃 종류는 클라 필터라 개수를 미리 셀 수 있다. 지역·시기는 서버를 다녀와야 알 수 있다.
  const showsCount = type === 'filter' && activeTab === 'flowers'

  const handleOpenSpot = (spotId?: number) => {
    if (spotId == null) return
    closeDrawer()
    router.push(`/spot/${spotId}`)
  }

  // 드로어를 열 때마다 applied 기준으로 되돌려, 지난번에 버리고 닫은 선택이 남지 않게 한다.
  useEffect(() => {
    if (isOpen && isFilterMode) syncDraft()
  }, [isOpen, isFilterMode, syncDraft])

  const openPreviewList = useCallback(async () => {
    setIsLoadingPreview(true)
    try {
      const preview = await spotPreviewApi(visibleSpotIds, {
        coords: mapCenter,
        // 고른 꽃·시기를 그대로 넘겨야 카드 뱃지가 지도 핀과 같은 기준으로 계산된다.
        categories: applied.categories,
        status: timingToStatus(applied.timing),
      })
      const items = preview ? toPinListItems(preview.items) : []

      // 필터 드로어를 먼저 닫고, 결과가 있을 때만 목록 드로어를 새로 띄운다.
      // 내용만 갈아끼우면 필터에서 확장해 둔 스냅(0.9)이 목록에 그대로 남는다.
      closeDrawer()
      setSnap('400px')
      if (items.length > 0) {
        setTimeout(() => openPinDrawer(items), DRAWER_CLOSE_MS)
      } else {
        // 목록을 안 띄우면 드로어만 닫혀 눌린 건지 알 수 없다.
        toast.info('조건에 맞는 명소가 없어요')
      }
    } catch (error) {
      console.error(error)
      toast.error('명소 목록을 불러오지 못했어요')
    } finally {
      setIsLoadingPreview(false)
    }
  }, [visibleSpotIds, mapCenter, applied, openPinDrawer, closeDrawer])

  // 하단 버튼 → 필터 커밋. 지도 조회가 끝나야 목록을 열 수 있어 대기 플래그를 세운다.
  const handleApplyFilter = () => {
    applyDraft()

    // 탐색 화면의 꽃 필터는 뒤에 지도가 없어 보여줄 핀 목록이 없다. 적용만 하고 닫는다.
    if (type === 'flower-filter') {
      closeDrawer()
      return
    }

    setIsPendingList(true)
  }

  // 지도가 새 applied 기준으로 다시 발행할 때까지 기다린다.
  // 드로어가 지도의 자식이라 effect 가 먼저 도는데, 그 시점의 visibleSpotIds 는
  // 아직 직전 필터 기준이라 그대로 열면 방금 건 필터가 목록에 반영되지 않는다.
  const isVisibleFresh = visibleAppliedFor === applied && !isVisibleStale

  useEffect(() => {
    if (!isPendingList || !isVisibleFresh) return
    setIsPendingList(false)
    void openPreviewList()
  }, [isPendingList, isVisibleFresh, openPreviewList])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  const snapPx =
    typeof snap === 'string'
      ? parseInt(snap)
      : typeof snap === 'number' && snap <= 1
        ? Math.round(snap * (typeof window !== 'undefined' ? window.innerHeight : 800))
        : typeof snap === 'number'
          ? snap
          : 400

  // 로그아웃 / 회원탈퇴 / 찜 확인 / 촬영일자 선택 / 삭제 확인 시트: snap 없이 콘텐츠 높이에 맞춰 올라오는 바텀시트
  if (
    type === 'logout' ||
    type === 'withdraw' ||
    type === 'save-spot' ||
    type === 'date-select' ||
    type === 'delete-confirm'
  ) {
    const title =
      type === 'logout'
        ? '로그아웃'
        : type === 'withdraw'
          ? '계정 탈퇴'
          : type === 'date-select'
            ? '촬영일자 선택'
            : type === 'delete-confirm'
              ? '삭제 확인'
              : '찜 추가'
    const description =
      type === 'logout'
        ? '현재 계정에서 로그아웃합니다.'
        : type === 'withdraw'
          ? '계정 탈퇴에 관한 안내와 선택지를 제공합니다.'
          : type === 'date-select'
            ? '방문 기록에 사용할 촬영일자를 선택합니다.'
            : type === 'delete-confirm'
              ? '선택한 항목을 삭제할지 확인합니다.'
              : '선택한 스팟을 찜 목록에 추가하고 개화 알림을 설정합니다.'
    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className="fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/40" />
          <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-100 mx-auto flex max-w-[430px] flex-col rounded-t-[20px] bg-white outline-none">
            <VaulDrawer.Title className="sr-only">{title}</VaulDrawer.Title>
            <VaulDrawer.Description className="sr-only">{description}</VaulDrawer.Description>
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />
            {type === 'logout' ? (
              <LogoutDrawerContent onClose={closeDrawer} />
            ) : type === 'withdraw' ? (
              <WithdrawDrawerContent onClose={closeDrawer} />
            ) : type === 'date-select' && dateSelectData ? (
              <DateSelectDrawerContent
                value={dateSelectData.value}
                onSelect={dateSelectData.onSelect}
                onClose={closeDrawer}
              />
            ) : type === 'delete-confirm' && deleteConfirmData ? (
              <DeleteConfirmDrawerContent
                onConfirm={deleteConfirmData.onConfirm}
                onClose={closeDrawer}
              />
            ) : saveSpotData ? (
              <SaveSpotDrawerContent spot={saveSpotData} onClose={closeDrawer} />
            ) : null}
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

  const snapPoints = ['400px', 0.9]
  const description =
    type === 'filter'
      ? '지역, 시기, 꽃 종류로 지도에 표시할 명소를 필터링합니다.'
      : type === 'flower-filter'
        ? '꽃 종류로 표시할 명소를 필터링합니다.'
        : '지도에서 선택한 명소 목록입니다.'

  function handleSnapChange(value: string | number | null) {
    setSnap(value)
    // isOpen 가드: Vaul이 닫힌 후 500ms 뒤에 snapPoints[0]으로 reset 호출하는데
    // 이때 isOpen=false이므로 setSnapHeight를 막아 LocationBtn이 튀는 현상을 방지
    if (typeof value === 'string' && isOpen) setSnapHeight(parseInt(value))
  }

  return (
    <VaulDrawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeDrawer()
          setSnap('400px')
        }
      }}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={handleSnapChange}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="pointer-events-none fixed inset-0 z-100 mx-auto max-w-[430px] bg-black/10 opacity-100!" />

        <VaulDrawer.Content className="pointer-events-auto fixed right-0 bottom-0 left-0 z-100 mx-auto flex h-full max-w-[430px] flex-col overflow-hidden rounded-t-[20px] bg-white outline-none">
          <VaulDrawer.Title className="sr-only">
            {type === 'filter' ? '검색 필터' : '명소 정보'}
          </VaulDrawer.Title>
          <VaulDrawer.Description className="sr-only">{description}</VaulDrawer.Description>

          <div className="bg-icon-quaternary mx-auto mt-4 mb-2 h-1 w-12 shrink-0 rounded-full" />

          {type === 'filter' || type === 'flower-filter' ? (
            <FilterDrawerContent
              snap={snap}
              onExpandToFull={() => setSnap(0.9)}
              flowersOnly={type === 'flower-filter'}
              onTabChange={setActiveTab}
            />
          ) : pinListData.length > 0 ? (
            <div
              className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-24"
              style={{ maxHeight: `${snapPx - 30}px` }}
              data-vaul-no-drag
              onPointerDown={(e) => e.stopPropagation()}
            >
              {pinListData.map((pin, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  className={pin.spotId != null ? 'cursor-pointer' : undefined}
                  onClick={() => handleOpenSpot(pin.spotId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleOpenSpot(pin.spotId)
                  }}
                >
                  <PinList {...pin} />
                </div>
              ))}
            </div>
          ) : null}

          {/* 목록이 여러 건이면 각 행을 눌러 들어가므로 하단 버튼을 두지 않는다. */}
          {(isFilterMode || pinListData.length === 1) && (
            <div
              className="absolute right-0 left-0 z-10 border-gray-100 bg-white p-4 transition-[bottom] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
              style={{ bottom: 'var(--snap-point-height, 0px)' }}
            >
              <Button
                variant="filled"
                size="lg"
                className="bg-brand-secondary active:bg-brand-secondary hover:bg-brand-secondary w-full cursor-pointer text-white"
                disabled={isFilterMode && (isLoadingPreview || isPendingList)}
                onClick={
                  isFilterMode ? handleApplyFilter : () => handleOpenSpot(pinListData[0]?.spotId)
                }
              >
                {type === 'flower-filter'
                  ? '적용하기'
                  : showsCount
                    ? `${draftVisibleCount}개의 명소 보기`
                    : '명소 보기'}
              </Button>
            </div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
