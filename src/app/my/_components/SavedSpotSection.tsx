import SpotCard from '@/components/ui/card/SpotCard'
import { SPOTProps } from '@/app/search/_components/SpotPanel'
import { SectionHeader } from '@/app/my/_components/SectionHeader'
import { SavedSpotEmpty } from '@/app/my/_components/SavedSpotEmpty'

interface Props {
  spots: SPOTProps[]
}

export function SavedSpotSection({ spots }: Props) {
  return (
    <section className="mt-4">
      <SectionHeader title={`저장한 스팟 (${spots.length})`} action="전체" href="/my/saved" />
      {spots.length === 0 ? (
        <SavedSpotEmpty />
      ) : (
        <ul className="divide-y divide-gray-100">
          {spots.map((spot) => (
            <SpotCard spot={spot} key={spot.id} />
          ))}
        </ul>
      )}
    </section>
  )
}
