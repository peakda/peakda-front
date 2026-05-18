import { cn } from '@/lib/utils/cn'
import { CheckIcon } from '../icon/CheckIcon'

interface StepperProps {
  steps: number
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex w-full items-center">
      {Array.from({ length: steps }, (_, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = stepNum === steps

        return (
          <div key={stepNum} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                isCompleted || isActive
                  ? 'border-2 border-pink-200 bg-pink-300 text-white'
                  : 'text-text-quaternary bg-[#F0F2F5]'
              )}
            >
              {isCompleted ? <CheckIcon /> : stepNum}
            </div>
            {!isLast && (
              <div
                className={cn('h-0.5 flex-1', isCompleted ? 'bg-pink-300' : 'bg-border-primary')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
