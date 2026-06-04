import { create } from 'zustand'
import type { MultiImageProps } from '@/types/types'

type DrawerType = 'filter' | 'flower-filter' | 'pin' | 'logout' | 'withdraw' | 'save-spot'

export interface SaveSpotData {
  name: string
  location: string
}

interface DrawerState {
  isOpen: boolean
  type: DrawerType
  snapHeight: number
  pinListData: MultiImageProps[]
  saveSpotData: SaveSpotData | null
  openFilterDrawer: () => void
  openFlowerFilterDrawer: () => void
  openPinDrawer: (data: MultiImageProps[]) => void
  openLogoutDrawer: () => void
  openWithdrawDrawer: () => void
  openSaveSpotDrawer: (data: SaveSpotData) => void
  closeDrawer: () => void
  setSnapHeight: (h: number) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  type: 'filter',
  snapHeight: 0,
  pinListData: [],
  saveSpotData: null,
  openFilterDrawer: () => set({ isOpen: true, type: 'filter', snapHeight: 400 }),
  openFlowerFilterDrawer: () => set({ isOpen: true, type: 'flower-filter', snapHeight: 400 }),
  openPinDrawer: (data) => set({ isOpen: true, type: 'pin', pinListData: data, snapHeight: 400 }),
  openLogoutDrawer: () => set({ isOpen: true, type: 'logout', snapHeight: 0 }),
  openWithdrawDrawer: () => set({ isOpen: true, type: 'withdraw', snapHeight: 0 }),
  openSaveSpotDrawer: (data) =>
    set({ isOpen: true, type: 'save-spot', saveSpotData: data, snapHeight: 0 }),
  closeDrawer: () => set({ isOpen: false, snapHeight: 0, pinListData: [] }),
  setSnapHeight: (h) => set({ snapHeight: h }),
}))
