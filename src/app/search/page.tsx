'use client'

import { useEffect, useRef, useState } from 'react'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { TabItem } from '@/context/TabContext'
import { RecentList } from './_components/RecentList'
import { HotChipList } from './_components/HotChipList'
import { SpotPanel } from './_components/SpotPanel'
import { UserPanel } from './_components/UserPanel'
import { SearchInput } from './_components/SearchInput'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { useHomeSuggestion } from '@/api/facades/home'
import { useSearchSpotsInfinite, useSearchUsersInfinite } from '@/api/facades/search'
import { useDebounce } from '@/hooks/useDebounce'
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { track } from '@/lib/analytics'
import { flattenPages } from '@/lib/utils/infinitePages'
import { shouldLoadMore } from '@/lib/utils/myRecords'
import { readStorage, writeStorage } from '@/lib/utils/storage'
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
  const [urlHydrated, setUrlHydrated] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  // localStorage 를 읽기 전에 빈 배열로 덮어쓰지 않도록 로드 완료를 기다린다
  const [recentLoaded, setRecentLoaded] = useState(false)

  const hasQuery = query.trim().length > 0
  const keyword = useDebounce(query.trim())

  const { data: suggestion } = useHomeSuggestion()
  const searchPlaceholder =
    suggestion?.available && suggestion.message ? suggestion.message : undefined

  // 스팟 결과 건수는 유저 탭에서도 헤더에 계속 보여주므로 스팟 쿼리는 항상 켜 둔다.
  // 유저 쿼리는 유저 탭을 실제로 연 뒤에만 나간다.
  // 유저 검색 API 는 인증이 필요해 비로그인은 유저 탭을 열면 로그인 시트를 띄우고 조회하지 않는다.
  const [activeTab, setActiveTab] = useState(SEARCH_TABS[0].value)
  const isLoggedIn = useIsLoggedIn()
  const requireLogin = useRequireLogin()
  const openUserLogin = () => {
    const params = new URLSearchParams({ q: query.trim(), tab: 'user' })
    requireLogin(() => {}, '유저를 검색하려면 로그인이 필요해요.', `/search?${params}`)
  }
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'user' && !isLoggedIn) openUserLogin()
  }
  const spotQuery = useSearchSpotsInfinite(keyword)
  const userQuery = useSearchUsersInfinite(keyword, activeTab === 'user' && isLoggedIn)
  const isCurrentSpotResult = keyword === query.trim() && !spotQuery.isPlaceholderData
  const isCurrentUserResult = keyword === query.trim() && !userQuery.isPlaceholderData
  const spots = flattenPages(spotQuery.data).map(toSpotProps)
  const users = flattenPages(userQuery.data).map(toUserProps)
  // 로드된 개수가 아니라 전체 건수를 보여준다(스크롤해도 숫자가 늘지 않도록)
  const spotTotal = spotQuery.data?.pages[0]?.totalElements ?? 0
  const isSpotCountLoading =
    keyword !== query.trim() || spotQuery.isPending || spotQuery.isPlaceholderData
  const spotCountLabel = isSpotCountLoading
    ? '검색 중'
    : spotQuery.isError && !spotQuery.data
      ? '결과 확인 실패'
      : `${spotTotal}개`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') ?? '')
    setActiveTab(params.get('tab') === 'user' ? 'user' : 'spot')
    setUrlHydrated(true)
  }, [])

  useEffect(() => {
    if (!urlHydrated) return
    const url = new URL(window.location.href)
    if (query.trim()) url.searchParams.set('q', query)
    else url.searchParams.delete('q')
    if (query.trim() && activeTab === 'user') url.searchParams.set('tab', 'user')
    else url.searchParams.delete('tab')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [query, activeTab, urlHydrated])

  // SSR 에는 localStorage 가 없으므로 마운트 후에 읽는다
  useEffect(() => {
    setRecentSearches(readRecentSearches(readStorage(RECENT_SEARCH_KEY)))
    setRecentLoaded(true)
  }, [])

  useEffect(() => {
    if (!recentLoaded) return
    writeStorage(RECENT_SEARCH_KEY, JSON.stringify(recentSearches))
  }, [recentSearches, recentLoaded])

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => removeRecentSearch(prev, item))
  }

  // 입력 중에는 글자마다 결과가 바뀌므로, 엔터나 결과 클릭으로 검색어를 확정했을 때만 search 를 보낸다.
  // 결과 영역 클릭마다 불리므로 같은 검색어는 한 번만 보낸다.
  const lastTrackedTermRef = useRef('')

  const submitSearch = (value: string) => {
    setRecentSearches((prev) => addRecentSearch(prev, value))

    const term = value.trim()
    if (!term || term === lastTrackedTermRef.current) return
    lastTrackedTermRef.current = term
    // 디바운스가 따라잡기 전에 엔터를 치면 결과 수가 직전 검색어 기준이라 이때는 빼고 보낸다.
    const isCountReady = keyword === term && spotQuery.isSuccess && !spotQuery.isFetching
    track('search', { search_term: term, result_count: isCountReady ? spotTotal : undefined })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 상단 검색 바 */}
      <SearchInput
        query={query}
        hasQuery={hasQuery}
        setQuery={(value) => {
          setQuery(value)
          if (typeof value === 'string' && !value.trim()) setActiveTab('spot')
        }}
        isCancle
        autoFocus
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
        <div onClickCapture={() => submitSearch(query)}>
          <Tabs tabs={SEARCH_TABS} defaultValue={activeTab} onValueChange={handleTabChange}>
            <span className="px-4 pt-2 pb-2 text-xs text-gray-400" aria-live="polite">
              스팟 결과 <span className="text-text-secondary font-medium">{spotCountLabel}</span>
            </span>
            <TabPanels tabs={SEARCH_TABS} className="mt-0">
              <SpotPanel
                spots={isCurrentSpotResult ? spots : []}
                isLoading={!spotQuery.isError && (!isCurrentSpotResult || spotQuery.isPending)}
                isError={spotQuery.isError}
                onRetry={() => void spotQuery.refetch()}
                onLoadMore={spotQuery.fetchNextPage}
                hasMore={
                  isCurrentSpotResult &&
                  shouldLoadMore(
                    spotQuery.hasNextPage,
                    spotQuery.isFetchingNextPage,
                    spotQuery.isFetchNextPageError
                  )
                }
                isLoadingMore={spotQuery.isFetchingNextPage}
                onRetryMore={
                  spotQuery.isFetchNextPageError ? () => void spotQuery.fetchNextPage() : undefined
                }
              />
              <UserPanel
                users={isCurrentUserResult ? users : []}
                isLoginRequired={!isLoggedIn}
                onLogin={openUserLogin}
                isLoading={
                  isLoggedIn && !userQuery.isError && (!isCurrentUserResult || userQuery.isPending)
                }
                isError={userQuery.isError}
                onRetry={() => void userQuery.refetch()}
                onLoadMore={userQuery.fetchNextPage}
                hasMore={
                  isCurrentUserResult &&
                  shouldLoadMore(
                    userQuery.hasNextPage,
                    userQuery.isFetchingNextPage,
                    userQuery.isFetchNextPageError
                  )
                }
                isLoadingMore={userQuery.isFetchingNextPage}
                onRetryMore={
                  userQuery.isFetchNextPageError ? () => void userQuery.fetchNextPage() : undefined
                }
              />
            </TabPanels>
          </Tabs>
        </div>
      )}
      <LazyDrawer />
    </div>
  )
}
