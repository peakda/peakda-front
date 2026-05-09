import Category from '@/components/ui/Category'
import MainMessage from '@/components/ui/MainMessage'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11">
      <MainMessage />
      <Category />
    </div>
  )
}
