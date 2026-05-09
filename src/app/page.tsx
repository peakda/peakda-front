import MainMessage from '@/components/ui/MainMessage'
import PinCard from '@/components/ui/PinCard'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11">
      <MainMessage />
      <PinCard
        Badges={['sadsads']}
        description="asdsa"
        isFavorite={false}
        location="sadsa"
        title="sadsad"
        TagText="절정"
      />
    </div>
  )
}
