import Card from '@/components/ui/card/Card'
import OnboardingMessage from '@/components/ui/message/OnboardingMessage'
import { cn } from '@/lib/utils/cn'
import { StepProps } from '@/types/types'

interface OnboardingMainProps {
  steps: readonly StepProps[]
  selectedIndex: number
}

export default function OnboardingMain({ steps, selectedIndex }: OnboardingMainProps) {
  return (
    <div className="flex h-full touch-pan-y">
      {steps.map((step, index) => (
        <div
          key={index}
          className="relative flex h-full flex-[0_0_100%] flex-col items-center justify-between px-4"
        >
          <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-10 pt-20">
            <OnboardingMessage
              key={index === selectedIndex ? `active-${selectedIndex}` : index}
              step={step}
            />
            <div
              className={cn(
                'grid w-full',
                step.Card?.length === 1 ? 'grid-cols-1' : 'grid-cols-3 gap-2'
              )}
            >
              {step.Card?.map((card, idx) => (
                <Card
                  key={idx}
                  variant={card.variant ?? 'big'}
                  title={card.title ?? ''}
                  description={card.description ?? ''}
                  image={card.image ?? ''}
                  className="w-full"
                />
              ))}
            </div>
          </div>
          <div className="h-[70%] flex-none" />
        </div>
      ))}
    </div>
  )
}
