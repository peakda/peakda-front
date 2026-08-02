import { create } from 'zustand'
import type { MultiImageProps } from '@/types/types'

type DrawerType =
  | 'filter'
  | 'flower-filter'
  | 'pin'
  | 'logout'
  | 'withdraw'
  | 'save-spot'
  | 'date-select'
  | 'delete-confirm'

export interface SaveSpotData {
  spotId: number
  name: string
  location: string
}

export interface DateSelectData {
  value: string
  onSelect: (value: string) => void
}

export interface DeleteConfirmData {
  onConfirm: () => void
}

interface DrawerState {
  isOpen: boolean
  type: DrawerType
  snapHeight: number
  pinListData: MultiImageProps[]
  saveSpotData: SaveSpotData | null
  dateSelectData: DateSelectData | null
  deleteConfirmData: DeleteConfirmData | null
  openFilterDrawer: () => void
  openFlowerFilterDrawer: () => void
  openPinDrawer: (data: MultiImageProps[]) => void
  openLogoutDrawer: () => void
  openWithdrawDrawer: () => void
  openSaveSpotDrawer: (data: SaveSpotData) => void
  openDateSelectDrawer: (value: string, onSelect: (value: string) => void) => void
  openDeleteConfirmDrawer: (onConfirm: () => void) => void
  closeDrawer: () => void
  setSnapHeight: (h: number) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  type: 'filter',
  snapHeight: 0,
  pinListData: [],
  saveSpotData: null,
  dateSelectData: null,
  deleteConfirmData: null,
  openFilterDrawer: () => set({ isOpen: true, type: 'filter', snapHeight: 400 }),
  openFlowerFilterDrawer: () => set({ isOpen: true, type: 'flower-filter', snapHeight: 400 }),
  openPinDrawer: (data) => set({ isOpen: true, type: 'pin', pinListData: data, snapHeight: 400 }),
  openLogoutDrawer: () => set({ isOpen: true, type: 'logout', snapHeight: 0 }),
  openWithdrawDrawer: () => set({ isOpen: true, type: 'withdraw', snapHeight: 0 }),
  openSaveSpotDrawer: (data) =>
    set({ isOpen: true, type: 'save-spot', saveSpotData: data, snapHeight: 0 }),
  openDateSelectDrawer: (value, onSelect) =>
    set({ isOpen: true, type: 'date-select', dateSelectData: { value, onSelect }, snapHeight: 0 }),
  openDeleteConfirmDrawer: (onConfirm) =>
    set({ isOpen: true, type: 'delete-confirm', deleteConfirmData: { onConfirm }, snapHeight: 0 }),
  closeDrawer: () => set({ isOpen: false, snapHeight: 0, pinListData: [] }),
  setSnapHeight: (h) => set({ snapHeight: h }),
}))
