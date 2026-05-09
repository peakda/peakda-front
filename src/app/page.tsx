import MainMessage from '@/components/ui/MainMessage'
import Toggle from '@/components/ui/Toggle'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11">
      <MainMessage />
      <Toggle initialStatus={false} />
    </div>
  )
}
