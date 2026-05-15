import { stepProps } from '@/types/types'
import Image from 'next/image'

interface Props {
  step: stepProps
  imageRef?: React.RefCallback<HTMLDivElement>
}

export default function OnboardingMessage({ step, imageRef }: Props) {
  return (
    <>
      <div ref={imageRef} className="animate-drop-in">
        <Image src={step.image} alt={step.title} width={80} height={80} />
      </div>
      <div className="flex w-full flex-col gap-2 text-center">
        <h2 className="text-var(--color-black) text-[24px]! font-semibold! tracking-tight">
          {step.title}
        </h2>
        <p className="text-var(--icon-secondary) text-[16px] leading-relaxed font-normal whitespace-pre-line">
          {step.description}
        </p>
      </div>
    </>
  )
}
