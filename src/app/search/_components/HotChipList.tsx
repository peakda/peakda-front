'use client'
import { Dispatch, SetStateAction } from 'react'
import { useTrendingSpots } from '@/api/facades/search'

interface Props {
  setQuery: Dispatch<SetStateAction<string>>
}

export function HotChipList({ setQuery }: Props) {
  const { data } = useTrendingSpots()
  const items = data?.items ?? []

  if (items.length === 0) return null

  return (
    <section>
      <p className="mb-3 text-sm font-semibold text-gray-800">지금 많이 찾는</p>
      <div className="flex flex-wrap gap-2">
        {items.map((spot) => (
          <button
            key={spot.spotId}
            onClick={() => setQuery(spot.name)}
            className="relative flex cursor-pointer items-center gap-1.5 rounded-full border border-[#F0F2F5] bg-[#F5F7FA] px-3 py-1.5 text-xs text-gray-600"
          >
            <span>{spot.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
