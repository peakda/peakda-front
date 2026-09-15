import { Badge } from '@/components/ui/display/Badge'
import { SectionHeader } from '@/app/my/_components/SectionHeader'

interface Props {
  flowers: string[]
  action?: string
  emptyDescription?: string
}

export function InterestFlowerSection({ flowers, action = '편집', emptyDescription }: Props) {
  return (
    <section className="mt-2">
      <SectionHeader title="관심 식물" action={action} href="/profile/edit" />
      {flowers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-2 text-center">
          <p className="text-text-primary text-base font-semibold">관심 식물이 없어요</p>
          {emptyDescription && <p className="text-text-tertiary text-sm">{emptyDescription}</p>}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 px-4">
          {flowers.map((flower) => (
            <Badge
              key={flower}
              label={flower}
              variant="outline"
              color="green"
              className="rounded-lg"
            />
          ))}
        </div>
      )}
    </section>
  )
}
