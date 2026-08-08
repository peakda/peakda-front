import { SpotCard } from '@/components/ui/card/SpotCard'
import { SPOTProps } from '@/app/search/_components/SpotPanel'
import { SectionHeader } from '@/app/my/_components/SectionHeader'
import { SavedSpotEmpty } from '@/app/my/_components/SavedSpotEmpty'

interface Props {
  spots: SPOTProps[]
  // 전체 찜 개수. spots 는 미리보기라 잘려 있을 수 있어 개수는 따로 받는다.
  count?: number
}

export function SavedSpotSection({ spots, count }: Props) {
  return (
    <section className="mt-4">
      <SectionHeader
        title={`저장한 스팟 (${count ?? spots.length})`}
        action="전체"
        href="/my/saved"
      />
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
