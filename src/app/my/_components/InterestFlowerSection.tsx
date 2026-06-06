import { Badge } from '@/components/ui/display/Badge'
import { SectionHeader } from '@/app/my/_components/SectionHeader'

interface Props {
  flowers: string[]
  action?: string
}

export function InterestFlowerSection({ flowers, action = '편집' }: Props) {
  return (
    <section className="mt-2">
      <SectionHeader title="관심 식물" action={action} />
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
    </section>
  )
}
