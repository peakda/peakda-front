import { create } from 'zustand'
import type { MultiImageProps } from '@/types/types'
import type { FeedReactionSummaryResponseMyReactionsItem } from '@/api/facades/generated/peakdaApi.schemas'

type DrawerType =
  | 'filter'
  | 'flower-filter'
  | 'pin'
  | 'logout'
  | 'withdraw'
  | 'save-spot'
  | 'date-select'
  | 'delete-confirm'
  | 'reaction'

export interface SaveSpotData {
  spotId: number
  name: string
  location: string
  // 확인 후 찜이 추가됐을 때 호출한 카드가 하트·종 상태를 바로 맞추도록 알린다.
  onSaved?: (notifyEnabled: boolean) => void
}

export interface DateSelectData {
  value: string
  onSelect: (value: string) => void
}

export interface DeleteConfirmData {
  onConfirm: () => void
}

export interface ReactionData {
  /** 내가 이미 남긴 리액션 — 시트에서 선택 상태로 표시한다 */
  selected: FeedReactionSummaryResponseMyReactionsItem[]
  onSelect: (type: FeedReactionSummaryResponseMyReactionsItem) => void
}

interface DrawerState {
  isOpen: boolean
  type: DrawerType
  snapHeight: number
  pinListData: MultiImageProps[]
  // 핀 목록에서 찜 시트를 열었을 때, 시트를 닫으면 되돌아갈 목록
  returnPinList: MultiImageProps[] | null
  saveSpotData: SaveSpotData | null
  dateSelectData: DateSelectData | null
  deleteConfirmData: DeleteConfirmData | null
  reactionData: ReactionData | null
  openFilterDrawer: () => void
  openFlowerFilterDrawer: () => void
  openPinDrawer: (data: MultiImageProps[]) => void
  openLogoutDrawer: () => void
  openWithdrawDrawer: () => void
  openSaveSpotDrawer: (data: SaveSpotData) => void
  openDateSelectDrawer: (value: string, onSelect: (value: string) => void) => void
  openDeleteConfirmDrawer: (onConfirm: () => void) => void
  openReactionDrawer: (data: ReactionData) => void
  closeDrawer: () => void
  // 핀 목록 데이터는 쿼리가 아니라 스냅샷이라, 찜·알림을 바꾸면 여기서 직접 맞춘다.
  updatePinFavorite: (spotId: number, isFavorite: boolean, notifyEnabled: boolean) => void
  setSnapHeight: (h: number) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  type: 'filter',
  snapHeight: 0,
  pinListData: [],
  returnPinList: null,
  saveSpotData: null,
  dateSelectData: null,
  deleteConfirmData: null,
  reactionData: null,
  openFilterDrawer: () => set({ isOpen: true, type: 'filter', snapHeight: 400 }),
  openFlowerFilterDrawer: () => set({ isOpen: true, type: 'flower-filter', snapHeight: 400 }),
  openPinDrawer: (data) => set({ isOpen: true, type: 'pin', pinListData: data, snapHeight: 400 }),
  openLogoutDrawer: () => set({ isOpen: true, type: 'logout', snapHeight: 0 }),
  openWithdrawDrawer: () => set({ isOpen: true, type: 'withdraw', snapHeight: 0 }),
  openSaveSpotDrawer: (data) =>
    set((s) => ({
      isOpen: true,
      type: 'save-spot',
      saveSpotData: data,
      snapHeight: 0,
      returnPinList: s.isOpen && s.type === 'pin' ? s.pinListData : null,
    })),
  openDateSelectDrawer: (value, onSelect) =>
    set({ isOpen: true, type: 'date-select', dateSelectData: { value, onSelect }, snapHeight: 0 }),
  openDeleteConfirmDrawer: (onConfirm) =>
    set({ isOpen: true, type: 'delete-confirm', deleteConfirmData: { onConfirm }, snapHeight: 0 }),
  openReactionDrawer: (data) =>
    set({ isOpen: true, type: 'reaction', reactionData: data, snapHeight: 0 }),
  closeDrawer: () =>
    set((s) =>
      s.type === 'save-spot' && s.returnPinList
        ? { type: 'pin', pinListData: s.returnPinList, returnPinList: null, snapHeight: 400 }
        : { isOpen: false, snapHeight: 0, pinListData: [], returnPinList: null }
    ),
  updatePinFavorite: (spotId, isFavorite, notifyEnabled) =>
    set((s) => {
      const patch = (list: MultiImageProps[]) =>
        list.map((pin) => (pin.spotId === spotId ? { ...pin, isFavorite, notifyEnabled } : pin))
      return {
        pinListData: patch(s.pinListData),
        returnPinList: s.returnPinList && patch(s.returnPinList),
      }
    }),
  setSnapHeight: (h) => set({ snapHeight: h }),
}))
