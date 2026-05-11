import { TabItem, useTabsContext } from '@/context/TabContext'
import { cn } from '@/lib/utils/cn'
import { KeyboardEvent, useCallback } from 'react'

export function TabTrigger({ tab, tabs }: { tab: TabItem; tabs: TabItem[] }) {
  const { active, setActive, uid } = useTabsContext()
  const isSelected = active === tab.value
  const enabledTabs = tabs.filter((t) => !t.disabled)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const cur = enabledTabs.findIndex((t) => t.value === tab.value)
      const len = enabledTabs.length
      let next: TabItem | undefined

      if (e.key === 'ArrowRight') next = enabledTabs[(cur + 1) % len]
      else if (e.key === 'ArrowLeft') next = enabledTabs[(cur - 1 + len) % len]
      else if (e.key === 'Home') next = enabledTabs[0]
      else if (e.key === 'End') next = enabledTabs[len - 1]

      if (next) {
        e.preventDefault()
        setActive(next.value)
        document.getElementById(`tab-${uid}-${next.value}`)?.focus()
      }
    },
    [enabledTabs, setActive, tab.value, uid]
  )

  return (
    <button
      id={`tab-${uid}-${tab.value}`}
      role="tab"
      aria-selected={isSelected}
      aria-controls={`panel-${uid}-${tab.value}`}
      aria-disabled={tab.disabled}
      disabled={tab.disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => !tab.disabled && setActive(tab.value)}
      onKeyDown={handleKeyDown}
      className={cn(
        // 공통
        'relative px-5 py-2.5 text-center text-sm transition-colors duration-200 outline-none select-none',
        // 언더라인
        'after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-0.5 after:origin-center after:rounded-full after:transition-transform after:duration-200',
        isSelected
          ? 'font-medium text-[#F87171] after:scale-x-100 after:bg-[#F87171]'
          : tab.disabled
            ? 'cursor-not-allowed text-gray-300 opacity-50 after:scale-x-0'
            : 'cursor-pointer text-gray-400 after:scale-x-0 after:bg-[#F87171] hover:text-gray-500',
        'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1'
      )}
    >
      {tab.label}
    </button>
  )
}
