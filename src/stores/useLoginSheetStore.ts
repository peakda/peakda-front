import { create } from 'zustand'
import { track } from '@/lib/analytics'

export const DEFAULT_LOGIN_SHEET_MESSAGE = '로그인이 필요한 기능이에요.'

// 로그인 바텀시트. <Drawer /> 는 페이지마다 따로 올라가 있어 어느 화면에서든 열 수 있도록
// 전용 스토어로 분리하고 Providers 에 한 번만 붙인다.
interface LoginSheetState {
  isOpen: boolean
  message: string
  openLoginSheet: (message?: string) => void
  closeLoginSheet: () => void
}

export const useLoginSheetStore = create<LoginSheetState>((set) => ({
  isOpen: false,
  message: DEFAULT_LOGIN_SHEET_MESSAGE,
  // 시트를 여는 곳(버튼·링크 가드·세션 만료)이 여러 군데라 이벤트는 여기서 한 번에 보낸다.
  // 문구가 기능마다 달라 비로그인 사용자가 어떤 기능에서 막혔는지 reason 으로 구분된다.
  openLoginSheet: (message = DEFAULT_LOGIN_SHEET_MESSAGE) => {
    track('login_prompt', { reason: message })
    set({ isOpen: true, message })
  },
  closeLoginSheet: () => set({ isOpen: false }),
}))
