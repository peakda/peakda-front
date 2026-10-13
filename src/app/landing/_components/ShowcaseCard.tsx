import Image from 'next/image'

export interface ShowcaseSlide {
  eyebrow: string
  lead: string
  highlight: string
  tail?: string
  image: string
  alt: string
}

interface ShowcaseCardProps {
  slide: ShowcaseSlide
}

// Figma 카드(540×960)를 그대로 비율로 줄인다. 글자·여백을 카드 너비 기준(cqw)으로 잡아
// 모바일 390px·태블릿 332px·데스크톱 400px 어디서든 시안과 같은 배치가 된다.
export const ShowcaseCard = ({ slide }: ShowcaseCardProps) => (
  <article className="@container relative aspect-[9/16] overflow-hidden bg-white bg-[linear-gradient(180deg,rgba(255,240,242,0.4)_55.4%,rgba(213,236,192,0.4)_100%)] md:rounded-[20px] md:border md:border-gray-200">
    <div className="px-[7.407cqw] pt-[5.926cqw]">
      <p className="text-[4.444cqw] leading-[1.4] tracking-[-0.02em] text-green-400">
        {slide.eyebrow}
      </p>
      <h3 className="mt-[1.481cqw] text-[7.037cqw] leading-[1.35] font-normal tracking-[-0.02em] text-green-800">
        {slide.lead}
        <br />
        <strong className="font-bold">{slide.highlight}</strong>
        {slide.tail}
      </h3>
    </div>
    {/* 휴대폰 이미지는 기기 테두리의 얇은 그림자까지 포함해 카드 안 (89,196) 위치에 362×732 로 놓인다 */}
    <Image
      src={slide.image}
      alt={slide.alt}
      width={543}
      height={1098}
      className="absolute top-[20.417%] left-[16.48%] h-auto w-[67.04%]"
    />
  </article>
)
