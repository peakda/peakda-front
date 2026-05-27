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

const SEARCH_TABS: TabItem[] = [
  { value: 'spot', label: '스팟' },
  { value: 'user', label: '유저' },
]

const MOCK_SPOTS: SPOTProps[] = [
  {
    id: 1,
    name: '여의도 한강공원 벚꽃길',
    location: '서울 영등포구',
    status: '빨리가요',
    nameList: ['asdasd', 'asdasd'],
  },
  {
    id: 2,
    name: '진해 군항제',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['asdasd', 'asdasd'],
  },
  {
    id: 3,
    name: '경주 벚꽃축제',
    location: '서울 영등포구',
    status: '빨리가요',
    nameList: ['asdasd', 'asdasd'],
  },
  {
    id: 4,
    name: '서울숲 벚꽃길',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['asdasd', 'asdasd'],
  },
  {
    id: 5,
    name: '대구 벚꽃길',
    location: '서울 영등포구',
    status: '이제 막요',
    nameList: ['asdasd', 'asdasd'],
  },
  {
    id: 6,
    name: '부산 해운대 벚꽃축제',
    location: '서울 영등포구',
    status: '빨리가요',
    nameList: ['asdasd', 'asdasd'],
  },
]

const MOCK_USERS: UserProps[] = [
  { id: 1, name: '닉네임', stats: '가족 nnn · 팔로위 nnn', following: false },
  { id: 2, name: '닉네임', stats: '팔로워 nnn · 팔로위 nnn', following: false },
  { id: 3, name: '닉네임', stats: '가족 500 · 팔로위 1000', following: false },
  { id: 4, name: '닉네임', stats: '가족 600 · 팔로위 1100', following: true },
  { id: 5, name: '닉네임', stats: '가족 700 · 팔로위 1100', following: false },
  { id: 6, name: '닉네임', stats: '가족 800 · 팔로위 1200', following: false },
  { id: 7, name: '닉네임', stats: '가족 900 · 팔로위 1300', following: true },
  { id: 8, name: '닉네임', stats: '가족 1000 · 팔로위 1400', following: false },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([
    '어디든 맞꽃',
    '진해 군항제',
    '단풍 명소',
    '제주 유채꽃',
  ])

  const hasQuery = query.trim().length > 0

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => prev.filter((r) => r !== item))
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 상단 검색 바 */}
      <SearchInput query={query} hasQuery={hasQuery} setQuery={setQuery} isCancle />
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
            스팟 결과 <span className="text-text-secondary font-medium">{MOCK_SPOTS.length}</span>개
          </span>
          <TabPanels tabs={SEARCH_TABS} className="mt-0">
            <SpotPanel spots={MOCK_SPOTS} />
            <UserPanel users={MOCK_USERS} />
          </TabPanels>
        </Tabs>
      )}
    </div>
  )
}
