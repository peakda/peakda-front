'use client'

import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { SpotCard } from '@/components/ui/card/SpotCard'
import { SavedSpotEmpty } from '@/app/my/_components/SavedSpotEmpty'
import { useFavoriteList } from '@/api/facades/spot-favorite'
import { toFavoriteSpotProps } from '@/lib/utils/spotFavorite'

export default function SavedSpotsPage() {
  const { data, isLoading } = useFavoriteList()
  const favorites = data?.favorites ?? []

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={
            <div className="text-[15px] font-medium text-[#000000]">
              찜한 스팟({data?.count ?? 0})
            </div>
          }
        />
      </div>

      {!isLoading &&
        (favorites.length === 0 ? (
          <SavedSpotEmpty />
        ) : (
          <ul className="divide-y divide-gray-100">
            {favorites.map((fav) => (
              <SpotCard
                key={fav.spotId}
                spot={toFavoriteSpotProps(fav)}
                favoriteSpotId={fav.spotId}
                initialFavorite
              />
            ))}
          </ul>
        ))}
    </div>
  )
}
