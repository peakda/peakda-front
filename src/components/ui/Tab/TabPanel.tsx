import { TabItem, useTabsContext } from '@/context/TabContext'
import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface TabPanelsProps {
  tabs: TabItem[]
  children: ReactNode[]
  className?: string
}

export function TabPanels({ tabs, children, className }: TabPanelsProps) {
  const { active, uid, mounted } = useTabsContext()

  return (
    <div className={cn('mt-4', className)}>
      {tabs.map((tab, i) => {
        const isActive = active === tab.value
        const isMounted = mounted.has(tab.value)
        const isLazy = tab.lazy ?? true

        if (isLazy && !isMounted) return null

        return (
          <div
            key={tab.value}
            id={`panel-${uid}-${tab.value}`}
            role="tabpanel"
            aria-labelledby={`tab-${uid}-${tab.value}`}
            tabIndex={0}
            hidden={!isActive}
            className="outline-none"
          >
            {children[i]}
          </div>
        )
      })}
    </div>
  )
}
