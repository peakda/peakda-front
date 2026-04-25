import { stepProps } from '@/types/types'
import Image from 'next/image'

export default function OnboardingMessage({ step }: { step: stepProps }) {
  return (
    <>
      <Image
        src={step.image}
        alt={step.title}
        className="animate-[bounce_1s_ease-in-out_1]"
        width={100}
        height={100}
      />
      <div className="flex w-full flex-col gap-2 text-center">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">{step.title}</h1>
        <p className="text-[16px] leading-relaxed whitespace-pre-line text-[#6B7280]">
          {step.description}
        </p>
      </div>
    </>
  )
}
