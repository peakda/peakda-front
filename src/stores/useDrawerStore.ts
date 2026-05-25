import { create } from 'zustand'

interface DrawerState {
  isOpen: boolean
  snapHeight: number
  openDrawer: () => void
  closeDrawer: () => void
  setSnapHeight: (h: number) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  snapHeight: 0,
  openDrawer: () => set({ isOpen: true, snapHeight: 400 }),
  closeDrawer: () => set({ isOpen: false, snapHeight: 0 }),
  setSnapHeight: (h) => set({ snapHeight: h }),
}))
