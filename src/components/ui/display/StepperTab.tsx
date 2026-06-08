import { cn } from '@/lib/utils/cn'

interface Props {
  currentStep: number
  totalSteps: number
}

export default function StepperTab({ currentStep, totalSteps }: Props) {
  return (
    <div className="flex h-1.5 w-full gap-1">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-full',
            i <= currentStep ? 'bg-brand-secondary' : 'bg-bg-tertiary'
          )}
        />
      ))}
    </div>
  )
}
