'use client'

import { useEffect, useState } from 'react'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { TabItem } from '@/context/TabContext'
import { RecentList } from './_components/RecentList'
import { HotChipList } from './_components/HotChipList'
import { SpotPanel } from './_components/SpotPanel'
import { UserPanel } from './_components/UserPanel'
import { SearchInput } from './_components/SearchInput'
import { useHomeSuggestion } from '@/api/facades/home'
import { useSearchSpotsInfinite, useSearchUsersInfinite } from '@/api/facades/search'
import { useDebounce } from '@/hooks/useDebounce'
import { flattenPages } from '@/lib/utils/infinitePages'
import {
  RECENT_SEARCH_KEY,
  addRecentSearch,
  readRecentSearches,
  removeRecentSearch,
  toSpotProps,
  toUserProps,
} from '@/lib/utils/search'

const SEARCH_TABS: TabItem[] = [
  { value: 'spot', label: '스팟' },
  { value: 'user', label: '유저' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  // localStorage 를 읽기 전에 빈 배열로 덮어쓰지 않도록 로드 완료를 기다린다
  const [recentLoaded, setRecentLoaded] = useState(false)

  const hasQuery = query.trim().length > 0
  const keyword = useDebounce(query.trim())

  const { data: suggestion } = useHomeSuggestion()
  const searchPlaceholder =
    suggestion?.available && suggestion.message ? suggestion.message : undefined

  const spotQuery = useSearchSpotsInfinite(keyword)
  const userQuery = useSearchUsersInfinite(keyword)
  const spots = flattenPages(spotQuery.data).map(toSpotProps)
  const users = flattenPages(userQuery.data).map(toUserProps)
  // 로드된 개수가 아니라 전체 건수를 보여준다(스크롤해도 숫자가 늘지 않도록)
  const spotTotal = spotQuery.data?.pages[0]?.totalElements ?? 0

  // SSR 에는 localStorage 가 없으므로 마운트 후에 읽는다
  useEffect(() => {
    setRecentSearches(readRecentSearches(window.localStorage.getItem(RECENT_SEARCH_KEY)))
    setRecentLoaded(true)
  }, [])

  useEffect(() => {
    if (!recentLoaded) return
    window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentSearches))
  }, [recentSearches, recentLoaded])

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => removeRecentSearch(prev, item))
  }

  const submitSearch = (value: string) => {
    setRecentSearches((prev) => addRecentSearch(prev, value))
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 상단 검색 바 */}
      <SearchInput
        query={query}
        hasQuery={hasQuery}
        setQuery={setQuery}
        isCancle
        placeholder={searchPlaceholder}
        onSubmit={submitSearch}
      />
      {!hasQuery ? (
        /* 빈 상태 */
        <div className="flex flex-col gap-6 px-4 py-2">
          {/* 최근 검색 */}
          <RecentList
            setQuery={setQuery}
            recentSearches={recentSearches}
            setRecentSearches={setRecentSearches}
            removeRecent={removeRecent}
          />
          {/* 요즘 급하게 찾는 */}
          <HotChipList setQuery={setQuery} />
        </div>
      ) : (
        /* 검색 결과 */
        <Tabs tabs={SEARCH_TABS} defaultValue="spot">
          <span className="px-4 pt-2 pb-2 text-xs text-gray-400">
            스팟 결과 <span className="text-text-secondary font-medium">{spotTotal}</span>개
          </span>
          <TabPanels tabs={SEARCH_TABS} className="mt-0">
            <SpotPanel
              spots={spots}
              onLoadMore={spotQuery.fetchNextPage}
              hasMore={spotQuery.hasNextPage && !spotQuery.isFetchingNextPage}
            />
            <UserPanel
              users={users}
              onLoadMore={userQuery.fetchNextPage}
              hasMore={userQuery.hasNextPage && !userQuery.isFetchingNextPage}
            />
          </TabPanels>
        </Tabs>
      )}
    </div>
  )
}
