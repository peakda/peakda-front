import { create } from 'zustand'
import type { MultiImageProps } from '@/types/types'

type DrawerType = 'filter' | 'pin'

interface DrawerState {
  isOpen: boolean
  type: DrawerType
  snapHeight: number
  pinListData: MultiImageProps[]
  openFilterDrawer: () => void
  openPinDrawer: (data: MultiImageProps[]) => void
  closeDrawer: () => void
  setSnapHeight: (h: number) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  type: 'filter',
  snapHeight: 0,
  pinListData: [],
  openFilterDrawer: () => set({ isOpen: true, type: 'filter', snapHeight: 400 }),
  openPinDrawer: (data) => set({ isOpen: true, type: 'pin', pinListData: data, snapHeight: 400 }),
  closeDrawer: () => set({ isOpen: false, snapHeight: 0, pinListData: [] }),
  setSnapHeight: (h) => set({ snapHeight: h }),
}))
