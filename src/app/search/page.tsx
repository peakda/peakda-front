'use client'

import { useState } from 'react'
import { Tabs } from '@/components/ui/Tab/Tab'
import { TabPanels } from '@/components/ui/Tab/TabPanel'
import { TabItem } from '@/context/TabContext'
import RecentList from './_components/RecentList'
import HotChipList from './_components/HotChipList'
import { SpotPanel, SPOTProps } from './_components/SpotPanel'
import { UserPanel, UserProps } from './_components/UserPanel'
import SearchInput from './_components/SearchInput'
import { useHomeSuggestion } from '@/api/facades/home'
import { useSearchSpots, useSearchUsers } from '@/api/facades/search'
import { useDebounce } from '@/hooks/useDebounce'

const SEARCH_TABS: TabItem[] = [
  { value: 'spot', label: '스팟' },
  { value: 'user', label: '유저' },
]

// 검색 API 는 스팟명·주소만 준다(개화상태·식물태그 없음). 없는 자리는 비운다.
const toSpotProps = (item: {
  spotId: number
  name: string
  address?: string | null
}): SPOTProps => ({
  id: item.spotId,
  name: item.name,
  location: item.address ?? '',
  status: '',
  nameList: [],
})

// 검색 API 는 닉네임만 준다(팔로워수·팔로우여부 없음).
const toUserProps = (item: { userId: number; nickname: string }): UserProps => ({
  id: item.userId,
  name: item.nickname,
  stats: '',
  following: false,
})

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([
    '어디든 맞꽃',
    '진해 군항제',
    '단풍 명소',
    '제주 유채꽃',
  ])

  const hasQuery = query.trim().length > 0
  const keyword = useDebounce(query.trim())

  const { data: suggestion } = useHomeSuggestion()
  const searchPlaceholder =
    suggestion?.available && suggestion.message ? suggestion.message : undefined

  const { data: spotResult } = useSearchSpots(keyword)
  const { data: userResult } = useSearchUsers(keyword)
  const spots = (spotResult?.content ?? []).map(toSpotProps)
  const users = (userResult?.content ?? []).map(toUserProps)

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => prev.filter((r) => r !== item))
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
            스팟 결과 <span className="text-text-secondary font-medium">{spots.length}</span>개
          </span>
          <TabPanels tabs={SEARCH_TABS} className="mt-0">
            <SpotPanel spots={spots} />
            <UserPanel users={users} />
          </TabPanels>
        </Tabs>
      )}
    </div>
  )
}
