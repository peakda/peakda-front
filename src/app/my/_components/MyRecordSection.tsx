import { Images } from 'lucide-react'
import Button from '@/components/ui/button/Button'
import IconBtn from '@/components/ui/button/IconBtn'
import { SectionHeader } from '@/app/my/_components/SectionHeader'
import { MyFeed } from '@/app/my/_components/MyFeed'

interface MyRecord {
  image: string
  date: string
  isPopular?: boolean
}

interface Props {
  records: MyRecord[]
  canRecord?: boolean
}

export function MyRecordSection({ records, canRecord = true }: Props) {
  return (
    <section className="mt-4">
      <SectionHeader title={`내 기록 (${records.length})`} action="전체" />
      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <IconBtn className="h-16 w-16">
            <Images className="text-icon-secondary h-8 w-8" strokeWidth={1.5} />
          </IconBtn>
          <p className="text-text-primary text-base font-semibold">아직 기록이 없어요</p>
          {canRecord && (
            <>
              <p className="text-text-tertiary text-sm">첫 스팟을 기록해보세요</p>
              <Button variant="filled" color="primary" size="md" className="mt-2">
                스팟 기록하기
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 px-4">
          {records.map((record, idx) => (
            <MyFeed key={idx} {...record} />
          ))}
        </div>
      )}
    </section>
  )
}
