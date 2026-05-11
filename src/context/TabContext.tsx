import { createContext, useContext } from 'react'

export interface TabItem {
  value: string
  label: string
  disabled?: boolean
  /** false 시 즉시 렌더링, 기본값 true (lazy) */
  lazy?: boolean
}

interface TabsContextValue {
  active: string
  setActive: (value: string) => void
  uid: string
  mounted: Set<string>
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('useTabsContext must be used inside <Tabs>')
  return ctx
}
