import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { BellIcon, DownloadIcon, GlobeIcon } from '@/app/landing/_components/LandingIcons'
import { LandingCarousel } from '@/app/landing/_components/LandingCarousel'
import { ShowcaseCard, type ShowcaseSlide } from '@/app/landing/_components/ShowcaseCard'
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

const SLIDES: ShowcaseSlide[] = [
  {
    eyebrow: '지금, 가장 예쁜 순간을 알려드려요',
    lead: '벚꽃부터 단풍까지,',
    highlight: '계절 명소의 지금 상태를 한눈에',
    image: '/images/landing/phone-1.webp',
    alt: '피크다 지도 화면 — 전국 계절 명소의 개화 상태를 꽃 핀으로 보여 준다',
  },
  {
    eyebrow: '이번 주, 어디가 좋을까요?',
    lead: '준비중·피기시작·만개,',
    highlight: '세 단계로 바로 확인해요',
    image: '/images/landing/phone-2.webp',
    alt: '명소 상세 화면 — 올해 만개 시기와 운영 시간·입장료·주차 정보',
  },
  {
    eyebrow: '찜만 해둬도, 놓치지 않아요',
    lead: '만개 예상 시기,',
    highlight: '미리 알려드릴게요',
    image: '/images/landing/phone-3.webp',
    alt: '명소 찜 화면 — 만개 예상일 7일 전에 알림을 받는 설정',
  },
  {
    eyebrow: '다녀온 사람들의 솔직한 기록',
    lead: '사진 한 장으로',
    highlight: '다녀왔던 곳을 기록',
    tail: '할 수 있어요',
    image: '/images/landing/phone-4.webp',
    alt: '스팟 기록 화면 — 위치·사진·촬영일자를 입력하는 단계',
  },
  {
    eyebrow: '이모지 하나로, 함께 만드는 타이밍 지도',
    lead: '실제 방문자들의',
    highlight: '사진과 반응으로 소통해요',
    image: '/images/landing/phone-5.webp',
    alt: '방문 기록 상세 화면 — 벚꽃길 사진과 방문자들의 이모지 반응',
  },
  {
    eyebrow: '수도권 밖, 숨은 계절 명소까지',
    lead: '매주 새로운',
    highlight: '명소와 스팟을 만나요',
    image: '/images/landing/phone-6.webp',
    alt: '이번 주 피크다 큐레이션 화면 — 절정을 향해 가는 코스모스 명소 소개',
  },
]

const FOOTER_LINKS = [
  { label: '문의하기', href: 'mailto:y_uxui@naver.com' },
  { label: '이용약관', href: `${SITE_URL}/Terms/terms-of-service` },
  { label: '개인정보처리방침', href: `${SITE_URL}/Terms/privacy-policy` },
  { label: '위치기반서비스 이용약관', href: `${SITE_URL}/Terms/location-policy` },
]

const optionTitleClass = 'text-lg leading-[1.55] font-semibold tracking-[-0.005em]'
const optionDescClass = 'mt-0.5 text-sm leading-normal'
const secondaryOptionClass =
  'flex h-[85px] items-center gap-3 rounded-[20px] border border-gray-200 bg-white px-5'

export default function LandingPage() {
  return (
    // data-landing: 루트 레이아웃의 430px 모바일 틀을 이 페이지에서만 푼다(layout.tsx).
    <div data-landing="" className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(LANDING_JSON_LD) }}
      />

      <header className="sticky top-0 z-10 bg-white">
        <div className="mx-auto flex h-14 max-w-360 items-center justify-between px-5 md:h-20 md:px-10 xl:px-20">
          <Image
            src="/images/landing/logo.webp"
            alt={SITE_BRAND_NAME}
            width={109}
            height={30}
            priority
          />
          <a
            href={SITE_URL}
            className="flex h-9 items-center rounded-full bg-green-600 px-[17px] text-sm font-bold text-white md:h-[39px] md:text-base"
          >
            웹으로 보기
          </a>
        </div>
      </header>

      <section className="bg-green-50">
        <div className="mx-auto flex max-w-360 px-5 pt-8 pb-10 md:px-10 md:py-16 xl:min-h-208 xl:items-center xl:justify-between xl:px-20 xl:py-0">
          <div className="w-full xl:max-w-160">
            <p className="text-[13px] leading-[1.4] font-medium tracking-[-0.01em] text-green-700 md:text-xl">
              벚꽃부터 단풍까지, 계절 여행의 타이밍
            </p>
            <h1 className="mt-4 text-4xl leading-[1.3] font-bold tracking-[-0.02em] text-gray-950 md:mt-6 xl:text-[60px] xl:leading-[1.2]">
              이번 주말,
              <br />
              지금 가도 예쁠까?
            </h1>
            <p className="mt-6 text-base leading-[1.4] tracking-[-0.01em] text-gray-600 md:text-xl">
              피크다에서 계절 명소를 찾고,
              <br />
              방문 기록으로 타이밍을 확인해요.
            </p>

            {/* 모바일은 웹 바로가기가 맨 위, 태블릿·데스크톱은 앱 두 개 아래 넓게 */}
            <div className="mt-6 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
              <a
                href={SITE_URL}
                className="order-first flex h-[83px] items-center gap-3 rounded-[20px] bg-green-600 px-5 shadow-[0_8px_24px_rgba(26,31,38,0.12)] md:order-last md:col-span-2"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-green-600">
                  <GlobeIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2.5">
                    <span className={cn(optionTitleClass, 'text-white')}>웹으로 명소 보기</span>
                    <span className="flex h-[22px] items-center rounded-full bg-pink-400 px-2.5 text-[11px] font-bold text-white">
                      바로 시작
                    </span>
                  </span>
                  <span className={cn('block', optionDescClass, 'text-green-100')}>
                    설치 없이 바로 확인해요 · 모든 기기
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-white" />
              </a>

              <a href={PLAY_STORE_URL} className={secondaryOptionClass}>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <DownloadIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block', optionTitleClass, 'text-gray-900')}>
                    Android 앱 설치
                  </span>
                  <span className={cn('block', optionDescClass, 'text-gray-600')}>
                    Google Play에서 받아요
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-gray-500" />
              </a>

              {/* iOS 출시 알림 신청 방식(이메일 수집)이 정해지면 링크/버튼으로 바꾼다 */}
              <div className={secondaryOptionClass}>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <BellIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block', optionTitleClass, 'text-gray-900')}>
                    iOS 앱 출시 알림
                  </span>
                  <span className={cn('block', optionDescClass, 'text-gray-600')}>
                    준비 중 · 이메일로 알려드려요
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-gray-500" />
              </div>
            </div>
          </div>

          {/* 데스크톱 시안에만 있는 휴대폰 두 대. 520×600 묶음 안 위치를 비율로 둔다 */}
          <div className="relative mr-5 hidden aspect-[520/600] w-[40.625%] shrink-0 xl:block">
            <Image
              src="/images/landing/phone-1.webp"
              alt="피크다 지도 화면"
              width={543}
              height={1098}
              className="absolute top-[-1.22%] left-[-1.12%] h-auto w-[50.7%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
            />
            <Image
              src="/images/landing/phone-2.webp"
              alt="피크다 명소 상세 화면"
              width={543}
              height={1098}
              className="absolute top-[12.78%] left-[50.42%] h-auto w-[50.7%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="landing-features"
        className="bg-white md:px-10 md:py-6 xl:px-20 xl:pt-24 xl:pb-12"
      >
        <h2 id="landing-features" className="sr-only">
          피크다로 할 수 있는 일
        </h2>
        <div className="mx-auto max-w-320">
          <LandingCarousel>
            {SLIDES.map((slide) => (
              <ShowcaseCard key={slide.image} slide={slide} />
            ))}
          </LandingCarousel>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-360 px-5 pt-12 pb-13 md:px-10 md:py-16 xl:grid-cols-[640px_1fr] xl:gap-x-10 xl:px-20 xl:pt-20 xl:pb-24">
          <p className="text-sm leading-[1.4] font-semibold tracking-[-0.01em] text-green-500 md:text-xl">
            벚꽃 · 수국 · 단풍 · 억새
          </p>
          <h2 className="mt-5 text-[28px] leading-[1.3] font-bold tracking-[-0.02em] text-gray-950 md:mt-4 md:text-[40px] md:leading-[1.2] xl:col-start-1">
            다녀온 순간이
            <br />
            다음 여행의 힌트가 돼요
          </h2>
          <p className="mt-5 text-base leading-[1.4] text-gray-600 md:mt-4 md:text-xl md:leading-[1.35] xl:col-start-2 xl:row-start-2">
            방문 사진과 절정도를 남기면
            <br />
            다른 사람의 여행에 도움이 돼요.
          </p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto max-w-360 px-5 py-12 md:px-10 md:pt-[62px] md:pb-16 xl:flex xl:items-center xl:justify-between xl:px-20 xl:py-24">
          <h2 className="text-[28px] leading-[1.3] font-bold tracking-[-0.02em] text-gray-950 md:text-[40px] md:leading-[1.2]">
            이번 주말의 계절 명소,
            <br />
            지금 찾아보세요
          </h2>
          <div className="mt-5 flex flex-col items-start gap-5 md:mt-[22px] md:w-80 xl:mt-0 xl:w-105 xl:gap-4">
            <a
              href={SITE_URL}
              className="flex h-12 w-full items-center justify-center rounded-full bg-pink-300 text-base font-bold text-white md:h-13 xl:h-14"
            >
              지금 명소 보기
            </a>
            <a
              href={PLAY_STORE_URL}
              className="text-sm leading-[1.4] text-gray-500 md:text-xl md:leading-[1.35]"
            >
              Android 앱 다운로드
            </a>
            <p className="text-sm leading-[1.4] text-gray-500 md:text-xl md:leading-[1.35]">
              iOS 앱 출시 알림 받기 →
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50">
        <div className="mx-auto flex max-w-360 flex-col gap-5 px-5 py-9 md:px-10 md:py-10 xl:grid xl:grid-cols-[1fr_auto] xl:gap-x-10 xl:gap-y-4 xl:px-20 xl:py-12">
          <Image src="/images/landing/logo.webp" alt={SITE_BRAND_NAME} width={101} height={28} />
          <nav
            aria-label="문의 및 약관"
            className="xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-center"
          >
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 xl:gap-x-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block text-sm leading-[1.4] font-medium text-gray-700"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[13px] leading-[1.3] text-gray-500 xl:col-start-1 xl:row-start-2">
            © 2026 MOTE STUDIO
          </p>
        </div>
      </footer>
    </div>
  )
}
