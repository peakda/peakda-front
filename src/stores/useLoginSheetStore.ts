import { create } from 'zustand'

// 로그인 바텀시트. <Drawer /> 는 페이지마다 따로 올라가 있어 어느 화면에서든 열 수 있도록
// 전용 스토어로 분리하고 Providers 에 한 번만 붙인다.
interface LoginSheetState {
  isOpen: boolean
  openLoginSheet: () => void
  closeLoginSheet: () => void
}

export const useLoginSheetStore = create<LoginSheetState>((set) => ({
  isOpen: false,
  openLoginSheet: () => set({ isOpen: true }),
  closeLoginSheet: () => set({ isOpen: false }),
}))
