'use client'
import { TabItem, TabsContext } from '@/context/TabContext'
import { ReactNode, useCallback, useId, useRef, useState } from 'react'
import { TabTrigger } from './TabTrigger'
import { cn } from '@/lib/utils/cn'

interface TabsProps {
  defaultValue: string
  tabs: TabItem[]
  children: ReactNode
  className?: string
  'aria-label'?: string
}

// 탭 정의 → defaultValue 지정 → TabPanels 자식 순서 = tabs 배열 순서
{
  /* <Tabs defaultValue="first" tabs={TABS}>
  <TabPanels tabs={TABS}>
    <div>첫 번째 패널</div>
    <div>두 번째 패널</div>
  </TabPanels>
</Tabs> */
}

export function Tabs({
  defaultValue,
  tabs,
  children,
  className,
  'aria-label': ariaLabel = '탭 목록',
}: TabsProps) {
  const uid = useId()
  const [active, setActiveRaw] = useState(defaultValue)
  const mountedRef = useRef<Set<string>>(new Set([defaultValue]))

  const setActive = useCallback((value: string) => {
    mountedRef.current.add(value)
    setActiveRaw(value)
  }, [])

  return (
    <TabsContext.Provider value={{ active, setActive, uid, mounted: mountedRef.current }}>
      <div className={cn('w-full', className)}>
        {/* Tab List */}
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="grid w-full grid-cols-3 border-b border-gray-200 px-4"
        >
          {tabs.map((tab) => (
            <TabTrigger key={tab.value} tab={tab} tabs={tabs} />
          ))}
        </div>

        {/* Tab Panels */}
        {children}
      </div>
    </TabsContext.Provider>
  )
}
