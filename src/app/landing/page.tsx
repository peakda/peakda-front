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
import { LaunchAlertForm } from '@/app/landing/_components/LaunchAlertForm'
import { Reveal } from '@/app/landing/_components/Reveal'
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

// 데스크톱 헤더에만 있는 섹션 이동 링크
const NAV_LINKS = [
  { label: '소개', href: '#intro' },
  { label: '기능', href: '#features' },
  { label: '알림 신청', href: '#waitlist' },
  { label: 'FAQ', href: '#faq' },
]

// 아이콘이 없는 메밀꽃·은행나무는 시안대로 글자만 둔다
const SEASON_CHIPS = [
  { label: '벚꽃', icon: '/flowers/cherry-blossom.webp', color: 'bg-[#FFA8B4]/20 text-[#FFA8B4]' },
  { label: '철쭉', icon: '/flowers/royal-azalea.webp', color: 'bg-[#E82A78]/20 text-[#E82A78]' },
  { label: '진달래', icon: '/flowers/azalea.webp', color: 'bg-[#FF6FA0]/20 text-[#FF6FA0]' },
  { label: '유채꽃', icon: '/flowers/canola.webp', color: 'bg-[#FFE87A]/20 text-[#FFE87A]' },
  { label: '매화', icon: '/flowers/plum.webp', color: 'bg-[#FF7F92]/20 text-[#FF7F92]' },
  { label: '산수유', icon: '/flowers/forsythia.webp', color: 'bg-[#FFD63A]/20 text-[#FFD63A]' },
  { label: '수국', icon: '/flowers/hydrangea.webp', color: 'bg-[#97CAFF]/20 text-[#97CAFF]' },
  { label: '연꽃', icon: '/flowers/lotus.webp', color: 'bg-[#FFCFD6]/20 text-[#FFCFD6]' },
  { label: '해바라기', icon: '/flowers/sunflower.webp', color: 'bg-[#FFB800]/20 text-[#FFB800]' },
  { label: '메밀꽃', icon: null, color: 'bg-[#A0B884]/20 text-[#A0B884]' },
  { label: '단풍', icon: '/flowers/maple.webp', color: 'bg-[#F0603A]/20 text-[#F0603A]' },
  { label: '은행나무', icon: null, color: 'bg-[#E0A800]/20 text-[#E0A800]' },
  { label: '억새', icon: '/flowers/SilverGrass.webp', color: 'bg-[#C2AA8A]/20 text-[#C2AA8A]' },
  { label: '코스모스', icon: '/flowers/cosmos.webp', color: 'bg-[#F07088]/20 text-[#F07088]' },
  { label: '동백꽃', icon: '/flowers/camellia.webp', color: 'bg-[#C8202A]/20 text-[#C8202A]' },
]

// 칩이 왼쪽부터 차례로 떠오르게 하는 지연(Tailwind 가 읽을 수 있게 클래스를 그대로 적는다)
const CHIP_DELAYS = [
  'delay-0',
  'delay-40',
  'delay-80',
  'delay-120',
  'delay-160',
  'delay-200',
  'delay-240',
  'delay-280',
  'delay-320',
  'delay-360',
  'delay-400',
  'delay-440',
  'delay-480',
  'delay-520',
  'delay-560',
]

// 시안은 가을 탭만 채워져 있어 탭은 보여 주기만 한다
const SEASON_TABS = [
  { label: '봄 · 벚꽃', active: false },
  { label: '여름 · 녹음', active: false },
  { label: '가을 · 단풍', active: true },
]

const STEPS = [
  { label: '01 마음에 드는 곳 찜하기', hint: '명소 화면에서 하트를 눌러요.', selected: true },
  { label: '02 만개 알림 켜기', hint: '찜한 명소의 만개 소식을 받아요.', selected: false },
]

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
const secondaryOptionClass =
  'flex flex-1 items-center gap-3 rounded-4xl border border-gray-200 bg-white px-5 py-4'
const optionIconClass =
  'flex size-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700'
const textLinkClass = 'text-sm leading-[1.55] font-bold text-green-600'
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
            <nav aria-label="랜딩 섹션" className="hidden xl:block">
              <ul className="flex gap-8">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[15px] leading-[1.3] font-medium text-gray-700"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href={SITE_URL}
              className="flex h-9 items-center rounded-xl bg-green-300 px-4 text-sm leading-[1.4] font-medium text-gray-50 md:h-10 md:rounded-2xl md:text-[15px]"
            >
              웹으로 보기
            </a>
          </div>
        </div>
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
            벚꽃도 단풍도, 보기 좋은 때에.
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
              className="flex items-center gap-3 rounded-4xl bg-green-600 px-5 py-4 shadow-[0_8px_24px_rgba(26,31,38,0.12)]"
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
          <div className="flex flex-col gap-2.5">
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
                  <br className="hidden md:block" /> 마음에 드는 풍경이 있다면 다음 여행에
                  담아두고요.
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
            <h2 className={sceneTitleClass}>지금 얼마나 피었는지 궁금하니까.</h2>
            <p className={sceneBodyClass}>
              예쁜 사진을 보고 찾아갔는데 꽃이 다 져 있으면 아쉬우니까요. 방문 날짜와 사진, 절정도를
              함께 보고 언제 갈지 정해 보세요.
            </p>
          </div>

          <div className="reveal-item flex w-full flex-col gap-5 rounded-[28px] bg-white p-[18px] delay-150 md:p-7 xl:flex-1">
            <div className="bg-landing-tab flex gap-1 rounded-[13px] p-1">
              {SEASON_TABS.map((tab) => (
                <span
                  key={tab.label}
                  className={cn(
                    'flex-1 rounded-xl p-1.5 text-center text-[11px] leading-[1.6] tracking-[-0.02em] md:text-[13px]',
                    tab.active ? 'bg-white font-bold text-green-600' : 'text-landing-tab-text'
                  )}
                >
                  {tab.label}
                </span>
              ))}
            </div>
            <div className="relative h-55 overflow-hidden rounded-3xl md:h-75">
              <Image
                src="/images/landing/record-naejangsan.webp"
                alt="붉고 노랗게 물든 내장산 단풍과 케이블카"
                fill
                sizes="(min-width: 1280px) 660px, (min-width: 768px) 698px, 306px"
                className="object-cover"
              />
            </div>
            <p className={eyebrowClass}>내장산 케이블카 · 가을 기록 예시</p>
            <h3 className="text-landing-ink text-xl leading-[1.45] font-bold tracking-[-0.02em] md:text-[26px]">
              다녀온 날은 이런 모습이었어요
            </h3>
            <p className="text-landing-muted text-[13px] leading-[1.7] md:text-[15px]">
              붉고 노랗게 물든 내장산의 가을 풍경이에요. 방문 날짜와 사진을 함께 보고 언제 갈지 정해
              보세요.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-white px-6 py-14 md:px-10 md:py-24 xl:px-30">
        <Reveal className="mx-auto flex max-w-300 flex-col items-center gap-7 md:gap-16 xl:flex-row">
          <div className="reveal-item bg-landing-mint rounded-6xl flex w-full justify-center px-6 py-8 md:py-6 xl:w-140 xl:shrink-0">
            <div className="bg-landing-phone rounded-[30px] p-[5.5px] shadow-[0_15px_24.7px_rgba(64,38,10,0.2)]">
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
            <h2 className={sceneTitleClass}>벚꽃 보러 갈까? 단풍 보러 갈까?</h2>
            <p className={sceneBodyClass}>
              보고 싶은 꽃이나 단풍, 갈 지역을 골라보세요. 지도에서도 주변 명소를 찾을 수 있어요.
              가보고 싶은 곳은 저장해 두세요.
            </p>
            <ul className="flex flex-wrap gap-2">
              {SEASON_CHIPS.map((chip, index) => (
                <li
                  key={chip.label}
                  className={cn(
                    'reveal-item flex items-center gap-[2.33px] rounded-full px-[7px] py-[4.67px]',
                    chip.color,
                    CHIP_DELAYS[index]
                  )}
                >
                  {chip.icon && (
                    <Image
                      src={chip.icon}
                      alt=""
                      width={19}
                      height={19}
                      className="size-[18.67px]"
                    />
                  )}
                  <span className="text-[12.83px] leading-normal font-semibold tracking-[-0.02em] md:font-bold">
                    {chip.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <hr className="border-gray-200" />
              <p className="text-landing-muted text-sm leading-[1.6] tracking-[-0.02em]">
                어떤 풍경이 보고 싶으세요?
              </p>
              <a
                href={`${SITE_URL}/map`}
                className="text-sm leading-[1.6] font-bold tracking-[-0.02em] text-green-600"
              >
                피크다에서 명소 찾기 →
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-landing-sage px-5 py-12 md:px-8 md:py-20 xl:px-30">
        <Reveal className="mx-auto flex max-w-300 flex-col gap-8 xl:flex-row xl:items-center xl:gap-20">
          <div className="reveal-item flex flex-col gap-4 xl:flex-1">
            <p className="text-xs leading-[1.55] font-bold text-green-600">
              03 마음에 드는 곳을 놓치지 않게
            </p>
            <h2 className="text-landing-ink text-3xl leading-[1.55] font-bold md:text-[40px]">
              가고 싶은 곳은 찜. 만개 소식은 알림으로.
            </h2>
            <p className="text-landing-muted text-[15px] leading-[1.55] md:text-[17px]">
              가보고 싶은 곳을 찾았다면 하트를 눌러두세요. 찜한 곳은 모아보고, 만개 알림도 받을 수
              있어요.
            </p>
            {/* 시안은 '찜하기' 단계 화면만 있어 선택 상태를 고정해 보여 준다 */}
            <ol className="flex flex-col gap-4">
              {STEPS.map((step) => (
                <li
                  key={step.label}
                  className={cn(
                    'flex flex-col gap-1 rounded-3xl border px-5 py-4',
                    step.selected ? 'border-green-300 bg-white' : 'border-landing-line'
                  )}
                >
                  <span className="text-landing-ink text-base leading-[1.55] font-bold">
                    {step.label}
                  </span>
                  <span className="text-landing-muted text-[13px] leading-[1.55]">{step.hint}</span>
                </li>
              ))}
            </ol>
            <a href={`${SITE_URL}/map`} className={textLinkClass}>
              찜하고 싶은 명소 찾아보기 ↗
            </a>
          </div>

          <figure className="reveal-item flex flex-col items-center gap-4 delay-150 xl:flex-1">
            <Image
              src="/images/landing/screen-spot-like.webp"
              alt="명소 상세 화면 — 하트를 눌러 찜하고 만개 시기를 확인한다"
              width={320}
              height={569}
              className="w-70 rounded-[18px] md:w-80"
            />
            <figcaption className="text-landing-muted text-center text-xs leading-[1.55]">
              명소 상세 화면에서 하트를 눌러 찜해두세요.
            </figcaption>
          </figure>
        </Reveal>
      </section>

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
                iOS 앱이 나오면 이메일로 알려드릴게요. 그동안 웹에서 둘러보세요.
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
            오늘 찍은 사진이 누군가에겐 필요한 소식.
          </h2>
          <p className="reveal-item text-landing-muted text-sm leading-[1.45] tracking-[-0.02em] delay-200 md:text-[17px]">
            다녀온 날짜와 사진, 절정도를 남겨주세요. 방문을 고민하는 사람에게 도움이 돼요.
          </p>
          <a
            href={SITE_URL}
            className="reveal-item w-58 rounded-full bg-green-600 p-4 text-base leading-[1.45] font-bold tracking-[-0.02em] text-white delay-300 md:w-65"
          >
            지금 명소 둘러보기 →
          </a>
        </Reveal>
      </section>

      <section
        id="faq"
        aria-labelledby="landing-faq-title"
        className={cn(anchorClass, 'bg-white px-5 py-12 md:px-10 md:py-22')}
      >
        <div className="mx-auto max-w-220">
          <p className="text-[13px] leading-[1.6] font-bold tracking-[-0.02em] text-green-600">
            궁금한 점이 있나요?
          </p>
          <h2
            id="landing-faq-title"
            className="text-landing-ink text-[26px] leading-[1.6] font-bold tracking-[-0.02em] md:text-[38px]"
          >
            자주 묻는 질문
          </h2>
          <ul className="mt-7 border-t border-gray-200">
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
        </div>
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
