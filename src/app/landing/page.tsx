import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { HeroVisual } from '@/app/landing/_components/HeroVisual'
import {
  BellIcon,
  CaretDownIcon,
  DownloadIcon,
  GlobeIcon,
} from '@/app/landing/_components/LandingIcons'
import { LandingNav } from '@/app/landing/_components/LandingNav'
import { LaunchAlertForm } from '@/app/landing/_components/LaunchAlertForm'
import { Reveal } from '@/app/landing/_components/Reveal'
import { SavedSteps } from '@/app/landing/_components/SavedSteps'
import { SeasonChips } from '@/app/landing/_components/SeasonChips'
import { SeasonRecord } from '@/app/landing/_components/SeasonRecord'
import { SpotPicks } from '@/app/landing/_components/SpotPicks'
import {
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  LANDING_URL,
  PLAY_STORE_URL,
  SITE_BRAND_NAME,
  SITE_NAME,
  SITE_NAME_KO,
  SITE_URL,
} from '@/constants/site'
import { cn } from '@/lib/utils/cn'
import { toJsonLdScript } from '@/lib/utils/spotSeo'

// landing.peakda.com 의 루트(middleware 가 /landing 으로 rewrite). www.peakda.com/landing 으로도 열리므로
// canonical 을 서브도메인으로 고정해 색인이 갈리지 않게 한다.
const TITLE = `이번 주말, 지금 가도 예쁠까? — 계절 명소 개화 타이밍 | ${SITE_BRAND_NAME}`
const DESCRIPTION =
  '벚꽃부터 단풍까지, 피크다(Peakda)에서 전국 계절 명소의 지금 상태를 확인하세요. 개화 단계와 만개 예상 시기, 다녀온 사람들의 방문 기록으로 여행 타이밍을 잡을 수 있어요.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: LANDING_URL },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    url: LANDING_URL,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_BRAND_NAME} — 계절 명소 개화·절정 타이밍` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

const LANDING_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: SITE_NAME,
  alternateName: SITE_NAME_KO,
  description: DESCRIPTION,
  operatingSystem: 'Android',
  applicationCategory: 'TravelApplication',
  installUrl: PLAY_STORE_URL,
  url: LANDING_URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  publisher: { '@id': `${SITE_URL}/#organization` },
}

const FAQS = [
  {
    question: '앱을 설치하지 않아도 사용할 수 있나요?',
    answer: '네. ‘웹으로 명소 보기’를 누르면 설치 없이 피크다에서 계절 명소를 둘러볼 수 있어요.',
  },
  {
    question: '사진이 지금의 모습을 보여주나요?',
    answer:
      '방문자가 다녀온 날의 사진이에요. 사진과 함께 방문 날짜를 확인해 주세요. 계절 풍경은 날씨와 시기에 따라 달라질 수 있어요.',
  },
  {
    question: '절정도는 무엇인가요?',
    answer:
      '방문자가 꽃이나 단풍의 상태를 남기는 기록이에요. 사진과 방문 날짜를 함께 보면 언제 갈지 판단하는 데 도움이 돼요.',
  },
]

const FOOTER_LINKS = [
  { label: '문의하기', href: 'mailto:y_uxui@naver.com' },
  { label: '이용약관', href: `${SITE_URL}/Terms/terms-of-service` },
  { label: '개인정보처리방침', href: `${SITE_URL}/Terms/privacy-policy` },
  { label: '위치기반서비스 이용약관', href: `${SITE_URL}/Terms/location-policy` },
]

// 섹션 머리말(01 떠나기 전 확인하세요 등)
const eyebrowClass = 'text-[13px] leading-[1.45] font-bold tracking-[-0.02em] text-green-600'
const sceneTitleClass =
  'text-landing-ink text-3xl leading-[1.45] font-bold tracking-[-0.02em] md:text-[42px]'
const sceneBodyClass =
  'text-landing-muted text-[15px] leading-[1.45] tracking-[-0.02em] md:text-[17px]'
const optionTitleClass = 'text-lg leading-[1.55] font-semibold tracking-[-0.005em]'
const optionDescClass = 'text-sm leading-normal font-medium'
// 히어로 시작 옵션은 hover 때 살짝 떠오른다(HTML 시안)
const optionLiftClass =
  'transition-[translate,box-shadow,border-color] duration-250 hover:-translate-y-[3px]'
const secondaryOptionClass = cn(
  'flex flex-1 items-center gap-3 rounded-4xl border border-gray-200 bg-white px-5 py-4 hover:border-[#9ebc88] hover:shadow-[0_8px_24px_#263e1610]',
  optionLiftClass
)
const optionIconClass =
  'flex size-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700'
// 밑줄이 있는 글자 링크 — hover 때 글자·밑줄이 진해진다
const textLinkClass =
  'hover:text-landing-ink w-fit border-b border-[#b6c8aa] pb-1 text-sm leading-[1.55] font-bold text-green-600 transition-colors duration-200 hover:border-current'
// 고정 헤더(모바일 65px·태블릿 이상 77px)에 가리지 않게 앵커 위치를 내린다
const anchorClass = 'scroll-mt-16 md:scroll-mt-20'

export default function LandingPage() {
  return (
    // data-landing: 루트 레이아웃의 430px 모바일 틀을 이 페이지에서만 푼다(layout.tsx).
    <div data-landing="" className="flex flex-col break-keep">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(LANDING_JSON_LD) }}
      />

      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-360 items-center justify-between px-5 py-3.5 md:px-8 md:py-[18px] xl:px-30">
          <Image
            src="/images/landing/logo.webp"
            alt={SITE_BRAND_NAME}
            width={130}
            height={36}
            priority
            className="h-7.5 w-auto md:h-9 xl:h-8.5"
          />
          <div className="flex items-center gap-8">
            <LandingNav />
            <a
              href={SITE_URL}
              className="flex h-9 items-center rounded-xl bg-green-300 px-4 text-sm leading-[1.4] font-medium text-gray-50 md:h-10 md:rounded-2xl md:text-[15px]"
            >
              웹으로 보기
            </a>
          </div>
        </div>
        {/* 스크롤 진행 막대 — 폭은 globals.css 의 스크롤 연동 애니메이션이 채운다 */}
        <div
          aria-hidden
          className="landing-progress absolute inset-x-0 -bottom-px h-0.5 bg-green-600"
        />
      </header>

      <section
        id="intro"
        className={cn(anchorClass, 'bg-white px-6 pt-9 pb-14 md:px-10 md:pt-16 md:pb-20 xl:px-30')}
      >
        <div className="mx-auto flex max-w-300 flex-col items-center gap-6 text-center md:gap-8">
          <p className="text-base leading-[1.45] font-bold tracking-[-0.02em] text-green-600">
            계절 명소를 찾을 땐, 피크다
          </p>
          <h1 className="text-landing-ink text-4xl leading-[1.45] font-bold tracking-[-0.02em] md:text-5xl xl:text-[64px]">
            벚꽃도 단풍도,
            <br />
            보기 좋은 때에.
          </h1>
          <p className="text-landing-muted text-sm leading-[1.45] tracking-[-0.02em] md:text-lg">
            최근 다녀온 사람들의 사진을 보고
            <br />
            언제 갈지 정해 보세요.
          </p>

          <div className="flex w-full flex-col gap-4 text-left md:max-w-172">
            <div className="flex flex-col gap-4 md:flex-row">
              <a href={PLAY_STORE_URL} className={secondaryOptionClass}>
                <span className={optionIconClass}>
                  <DownloadIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-gray-900', optionTitleClass)}>
                    Android 앱 설치
                  </span>
                  <span className={cn('block text-gray-600', optionDescClass)}>
                    Google Play에서 받아요
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-gray-500" />
              </a>
              {/* 시안 인터랙션: 누르면 아래 '알림 신청' 섹션으로 스크롤 */}
              <a href="#waitlist" className={secondaryOptionClass}>
                <span className={optionIconClass}>
                  <BellIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-gray-900', optionTitleClass)}>
                    iOS 앱 출시 알림
                  </span>
                  <span className={cn('block text-gray-600', optionDescClass)}>
                    준비 중 · 이메일로 알려드려요
                  </span>
                </span>
                <ArrowDown aria-hidden className="size-5 shrink-0 text-gray-500" />
              </a>
            </div>

            <a
              href={SITE_URL}
              className={cn(
                'flex items-center gap-3 rounded-4xl bg-green-600 px-5 py-4 shadow-[0_8px_24px_rgba(26,31,38,0.12)]',
                optionLiftClass
              )}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-green-600">
                <GlobeIcon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={cn('text-white', optionTitleClass)}>웹으로 명소 보기</span>
                  <span className="rounded-full bg-pink-400 px-2.5 py-1 text-[11px] leading-[1.3] font-bold tracking-[-0.02em] text-white">
                    바로 시작
                  </span>
                </span>
                <span className={cn('block text-green-100', optionDescClass)}>
                  설치 없이 바로 둘러보세요
                </span>
              </span>
              <ArrowRight aria-hidden className="size-5 shrink-0 text-white" />
            </a>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section className="bg-white px-5 pt-12 pb-14 md:px-8 md:pt-18 md:pb-20 xl:px-30">
        <div className="mx-auto flex max-w-300 flex-col gap-7 md:gap-10">
          <Reveal>
            <div className="reveal-item flex flex-col gap-2.5">
              <p className="text-[13px] leading-[1.3] tracking-[-0.02em] text-green-500">
                피크다가 고른 가을 명소
              </p>
              <h2 className="text-[26px] leading-[1.3] font-bold tracking-[-0.02em] text-gray-950 md:text-[32px] xl:text-[38px]">
                이번 주말엔, 가을 산책 어때요?
              </h2>
              <p className="text-[15px] leading-normal text-gray-600 md:text-[17px]">
                꽃구경부터 강변 산책까지, 걷고 싶은 풍경을 골라보세요.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <SpotPicks />
          </Reveal>

          <Reveal>
            <div className="reveal-item bg-landing-sage rounded-5xl flex flex-col items-center gap-7 p-6 md:flex-row md:gap-10 md:px-10 md:py-8">
              <div className="flex w-full flex-col gap-3.5 md:flex-1">
                <p className="text-xs leading-[1.55] font-bold text-green-600">
                  어디로 갈지 고민될 땐
                </p>
                <h3 className="text-landing-ink text-[27px] leading-[1.55] font-bold md:text-[32px]">
                  아는 곳 말고,
                  <br />
                  새로운 계절 명소도.
                </h3>
                <p className="text-landing-muted text-sm leading-[1.55] md:text-base">
                  피크다가 모아둔 명소 이야기를 읽어보세요.
                  <br />
                  마음에 드는 풍경이 있다면 다음 여행에 담아두고요.
                </p>
                <a href={`${SITE_URL}/explore`} className={textLinkClass}>
                  피크다가 고른 명소 보기 ↗
                </a>
              </div>
              <Image
                src="/images/landing/screen-curation.webp"
                alt="피크다 이번 주 큐레이션 화면 — 절정을 향해 가는 코스모스 명소 소개"
                width={220}
                height={391}
                className="shrink-0 rounded-[18px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="features"
        className={cn(anchorClass, 'bg-landing-sage px-6 py-14 md:px-10 md:py-22 xl:px-30')}
      >
        <Reveal className="mx-auto flex max-w-300 flex-col items-center gap-7 md:gap-16 xl:flex-row">
          <div className="reveal-item flex w-full flex-col gap-5 xl:w-105 xl:shrink-0">
            <p className={eyebrowClass}>01 떠나기 전 확인하세요</p>
            <h2 className={sceneTitleClass}>
              지금 얼마나 피었는지
              <br />
              궁금하니까.
            </h2>
            <p className={sceneBodyClass}>
              예쁜 사진을 보고 찾아갔는데
              <br />
              꽃이 다 져 있으면 아쉬우니까요.
              <br />
              방문 날짜와 사진, 절정도를 함께 보고
              <br />
              언제 갈지 정해 보세요.
            </p>
          </div>

          <div className="reveal-item flex w-full flex-col gap-5 rounded-[28px] bg-white p-[18px] delay-150 md:p-7 xl:flex-1">
            <SeasonRecord />
          </div>
        </Reveal>
      </section>

      <section className="bg-white px-6 py-14 md:px-10 md:py-24 xl:px-30">
        <Reveal className="mx-auto flex max-w-300 flex-col items-center gap-7 md:gap-16 xl:flex-row">
          {/* hover 하면 휴대폰이 살짝 떠오르며 기운다 */}
          <div className="reveal-item bg-landing-mint rounded-6xl group/map flex w-full justify-center px-6 py-8 md:py-6 xl:w-140 xl:shrink-0">
            <div className="bg-landing-phone rounded-[30px] p-[5.5px] shadow-[0_15px_24.7px_rgba(64,38,10,0.2)] group-hover/map:-translate-y-1.5 group-hover/map:-rotate-1 motion-safe:transition-[translate,rotate] motion-safe:duration-600">
              <Image
                src="/images/landing/screen-map.webp"
                alt="피크다 지도 화면 — 전국 계절 명소의 개화 상태를 꽃 핀으로 보여 준다"
                width={242}
                height={525}
                className="rounded-[24.7px]"
              />
            </div>
          </div>

          <div className="reveal-item flex w-full flex-col gap-5 delay-150 xl:flex-1">
            <p className={eyebrowClass}>02 가보고 싶은 곳을 찾아보세요</p>
            <h2 className={sceneTitleClass}>
              벚꽃 보러 갈까?
              <br />
              단풍 보러 갈까?
            </h2>
            <p className={sceneBodyClass}>
              보고 싶은 꽃이나 단풍, 갈 지역을 골라보세요.
              <br />
              지도에서도 주변 명소를 찾을 수 있어요.
              <br />
              가보고 싶은 곳은 저장해 두세요.
            </p>
            <SeasonChips />
          </div>
        </Reveal>
      </section>

      <SavedSteps />

      <section
        id="waitlist"
        className={cn(anchorClass, 'bg-white px-5 py-14 md:px-8 md:py-18 xl:px-30 xl:py-24')}
      >
        <Reveal className="mx-auto max-w-300">
          <div className="reveal-item rounded-5xl md:rounded-6xl relative flex flex-col gap-7 overflow-hidden bg-green-700 p-6 shadow-[0_20px_48px_rgba(40,80,17,0.25)] md:gap-12 md:p-12 xl:flex-row xl:items-center xl:gap-16 xl:p-16">
            <div
              aria-hidden
              className="absolute -top-35 -right-22.5 size-80 rounded-full bg-[rgba(141,196,104,0.28)] blur-[55px] md:-top-45 md:-right-17.5 md:size-105 xl:-top-50 xl:-right-20 xl:size-115"
            />
            <div className="relative flex flex-col items-start gap-4 xl:flex-1">
              <span className="rounded-full bg-green-300 px-2.5 py-1 text-[13px] leading-[1.3] font-bold tracking-[-0.02em] text-green-800 md:bg-green-100 md:text-green-700">
                출시 알림
              </span>
              <h2 className="text-[26px] leading-[1.3] font-bold tracking-[-0.02em] text-white md:text-[32px] xl:text-[38px]">
                iPhone에서도 곧 만나요
              </h2>
              <p className="text-[15px] leading-normal text-green-100 md:text-[17px]">
                iOS 앱이 나오면 이메일로 알려드릴게요.
                <br />
                그동안 웹에서 둘러보세요.
              </p>
            </div>
            <div className="relative w-full xl:w-115 xl:shrink-0">
              <LaunchAlertForm />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-landing-cream px-6 py-12 md:px-10 md:py-18 xl:px-30">
        <Reveal className="mx-auto flex max-w-300 flex-col items-center gap-6 text-center">
          <p className="reveal-item text-[13px] leading-[1.45] tracking-[-0.02em] text-green-600">
            04 다녀온 소식도 들려주세요
          </p>
          <h2 className="reveal-item text-landing-ink text-3xl leading-[1.45] font-bold tracking-[-0.02em] delay-100 md:text-[44px]">
            오늘 찍은 사진이
            <br />
            누군가에겐 필요한 소식.
          </h2>
          <p className="reveal-item text-landing-muted text-sm leading-[1.45] tracking-[-0.02em] delay-200 md:text-[17px]">
            다녀온 날짜와 사진, 절정도를 남겨주세요.
            <br />
            방문을 고민하는 사람에게 도움이 돼요.
          </p>
          {/* reveal-item 이 translate 로 떠오르므로 hover 리프트는 안쪽 a 에 건다 */}
          <div className="reveal-item delay-300">
            <a
              href={SITE_URL}
              className="block w-58 rounded-full bg-green-600 p-4 text-base leading-[1.45] font-bold tracking-[-0.02em] text-white transition-[translate,background-color] duration-250 hover:-translate-y-[3px] hover:bg-green-700 md:w-65"
            >
              지금 명소 둘러보기 →
            </a>
          </div>
        </Reveal>
      </section>

      <section
        id="faq"
        aria-labelledby="landing-faq-title"
        className={cn(anchorClass, 'bg-white px-5 py-12 md:px-10 md:py-22')}
      >
        <Reveal className="mx-auto max-w-220">
          <div className="reveal-item">
            <p className="text-[13px] leading-[1.6] font-bold tracking-[-0.02em] text-green-600">
              궁금한 점이 있나요?
            </p>
            <h2
              id="landing-faq-title"
              className="text-landing-ink text-[26px] leading-[1.6] font-bold tracking-[-0.02em] md:text-[38px]"
            >
              자주 묻는 질문
            </h2>
          </div>
          <ul className="reveal-item mt-7 border-t border-gray-200 delay-100">
            {FAQS.map((faq) => (
              <li key={faq.question} className="border-b border-gray-200">
                <details className="landing-faq group">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 group-open:pb-[18px] md:py-6 md:group-open:pb-[18px] [&::-webkit-details-marker]:hidden">
                    <span className="text-landing-ink flex-1 text-[15px] leading-[1.6] font-bold tracking-[-0.02em] md:text-lg">
                      {faq.question}
                    </span>
                    <CaretDownIcon className="size-6 shrink-0 text-gray-700 group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-300" />
                  </summary>
                  <p className="text-landing-muted pb-5 text-sm leading-[1.6] tracking-[-0.02em] md:pb-6 md:text-base">
                    {faq.answer}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <footer className="bg-gray-50 px-5 py-9 md:px-8 md:py-12 xl:px-30">
        <div className="mx-auto flex max-w-300 flex-col gap-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <Image src="/images/landing/logo.webp" alt={SITE_BRAND_NAME} width={101} height={28} />
            <nav aria-label="문의 및 약관">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 xl:gap-x-6">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm leading-[1.3] font-medium text-gray-700">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="text-[13px] leading-normal text-gray-500">
            데이터 출처 · 한국관광공사 TourAPI, 기상청 데이터 기반
          </p>
          <p className="text-[13px] leading-[1.3] text-gray-500">© 2026 MOTE STUDIO</p>
        </div>
      </footer>
    </div>
  )
}
