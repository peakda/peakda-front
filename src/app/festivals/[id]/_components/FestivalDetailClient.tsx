'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, Calendar, Clock, Globe, MapPin, Ticket } from 'lucide-react'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { Button } from '@/components/ui/button/Button'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { cn } from '@/lib/utils/cn'
import type { FestivalDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { buildMapUrl } from '@/lib/utils/spotCta'
import { FESTIVAL_PHASE_LABEL as PHASE_LABEL } from '@/lib/utils/explore'

// 축제에는 대표 이미지가 없을 수 있다(에디토리얼이 없으면 heroImageUrl 도 없다).
const HERO_PLACEHOLDER = '/images/explore.png'

// '2026-07-19' → '7월 19일'. 파싱 실패 시 원본 반환.
const formatDate = (iso: string) => {
  const [, m, d] = iso.split('-')
  return m && d ? `${Number(m)}월 ${Number(d)}일` : iso
}

// 'YYYY-MM-DD'(KST 기준일)와 오늘(KST) 사이의 일수 차. 양수면 아직 시작 전, 파싱 실패면 null.
// 브라우저 로컬 타임존으로 계산하면 해외 접속 시 하루 어긋나므로 KST 로 고정한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

function daysUntilKst(iso: string): number | null {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const todayKst = Math.floor((Date.now() + KST_OFFSET_MS) / DAY_MS) * DAY_MS
  return Math.round((Date.UTC(y, m - 1, d) - todayKst) / DAY_MS)
}

// 개행으로 구분된 안내 텍스트를 줄 단위로 쪼갠다.
const toLines = (text?: string | null) =>
  (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

interface FestivalDetailClientProps {
  festival: FestivalDetailResponse
}

// 본문은 서버(page.tsx)가 조회한 응답으로 그린다. 없는 id 는 서버에서 404 로 끝난다.
export function FestivalDetailClient({ festival }: FestivalDetailClientProps) {
  const router = useRouter()

  const editorial = festival.editorial
  const phaseLabel = festival.phase ? PHASE_LABEL[festival.phase] : null

  // 시작 전이면 개막까지, 진행 중이면 종료까지 남은 일수를 보여준다.
  // 응답의 dDay 는 writeOnly 라 내려오지 않으므로 startsOn 으로 직접 계산한다.
  const daysUntilStart = festival.startsOn ? daysUntilKst(festival.startsOn) : null
  const dDayLabel = (() => {
    if (daysUntilStart != null && daysUntilStart > 0) return `D-${daysUntilStart}`
    if (daysUntilStart === 0) return 'D-DAY'
    if (festival.endsInDays != null) return `종료 D-${festival.endsInDays}`
    return null
  })()

  const period = festival.startsOn
    ? [formatDate(festival.startsOn), festival.endsOn ? formatDate(festival.endsOn) : null]
        .filter(Boolean)
        .join(' ~ ')
    : null
  const place = festival.roadAddress ?? festival.venue
  const highlights = [...(editorial?.highlights ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const transitLines = toLines(editorial?.directionsTransit)
  const carLines = toLines(editorial?.directionsCar)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-28">
      {/* 히어로 이미지 */}
      <div className="relative h-64 w-full">
        <Header left={<LeftArrow />} />
        <Image
          src={editorial?.heroImageUrl ?? HERO_PLACEHOLDER}
          alt={festival.name}
          fill
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-1">
            {period && <CardBadge label={period} variant="dark" />}
            {phaseLabel && <CardBadge label={phaseLabel} variant="bloom" />}
            {dDayLabel && <CardBadge label={dDayLabel} variant="dark" />}
          </div>
          <h1 className="text-xl font-bold text-white">{festival.name}</h1>
          <span className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* 소개 텍스트 */}
        {editorial?.hook && (
          <p className="text-text-secondary text-sm leading-[1.5]">{editorial.hook}</p>
        )}

        {/* 핵심 정보: 기간 / 장소 / 요금 / 시간 / 주의사항 — 값이 없는 행은 렌더하지 않는다 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-base font-semibold">핵심 정보</h2>
          <div className="divide-border-primary flex flex-col divide-y divide-dashed">
            {period && (
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="기간"
                value={period}
                note={editorial?.periodNote}
              />
            )}
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="장소"
              value={place}
              note={editorial?.placeNote}
            />
            {editorial?.admissionFee && (
              <InfoRow
                icon={<Ticket className="h-4 w-4" />}
                label="요금"
                value={editorial.admissionFee}
                note={editorial.admissionFeeNote}
              />
            )}
            {editorial?.operatingHours && (
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="시간"
                value={editorial.operatingHours}
                note={editorial.operatingHoursNote}
              />
            )}
            {editorial?.caution && (
              <InfoRow
                icon={<AlertCircle className="h-4 w-4" />}
                label="주의"
                value={editorial.caution}
                note={editorial.cautionNote}
                tone="warning"
              />
            )}
          </div>
        </div>
      </div>

      {/* 주요 볼거리 */}
      {highlights.length > 0 && (
        <div className="border-border-primary flex flex-col gap-2 border-t px-4 py-4">
          <h2 className="text-text-primary text-base font-semibold">주요 볼거리</h2>
          <ul className="flex flex-col gap-2">
            {highlights.map((highlight) => (
              <li key={highlight.sortOrder} className="flex items-start gap-2">
                <span className="bg-text-tertiary mt-2 h-1 w-1 shrink-0 rounded-full" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-primary text-sm font-medium">{highlight.title}</span>
                  <span className="text-text-secondary text-sm leading-[1.5]">{highlight.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 오시는 방법 */}
      {(transitLines.length > 0 || carLines.length > 0) && (
        <div className="border-border-primary flex flex-col gap-3 border-t px-4 py-4">
          <h2 className="text-text-primary text-base font-semibold">오시는 방법</h2>
          {transitLines.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">대중교통</span>
              {transitLines.map((line) => (
                <p key={line} className="text-text-secondary text-sm leading-[1.5]">
                  {line}
                </p>
              ))}
            </div>
          )}
          {carLines.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">자가 차량</span>
              {carLines.map((line) => (
                <p key={line} className="text-text-secondary text-sm leading-[1.5]">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 공식 홈페이지 — 응답에 연락처 필드가 없어 홈페이지 링크로 대체한다 */}
      {festival.homepageUrl && (
        <div className="flex flex-col gap-2 px-4 py-4">
          <h2 className="text-text-primary text-base font-semibold">공식 홈페이지</h2>
          <a
            href={festival.homepageUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-text-secondary flex items-center gap-1.5 text-sm underline"
          >
            <Globe className="h-4 w-4 shrink-0" />
            {festival.homepageUrl}
          </a>
        </div>
      )}

      {/* 하단 CTA */}
      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="flex-1"
          onClick={() => router.push(buildMapUrl(festival))}
        >
          지도에서 보기
        </Button>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  note,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string
  note?: string | null
  tone?: 'default' | 'warning'
}) {
  const isWarning = tone === 'warning'
  return (
    <div className="flex items-start gap-2 py-3 first:pt-0 last:pb-0">
      <span className={cn('mt-0.5 shrink-0', isWarning ? 'text-warning' : 'text-text-tertiary')}>
        {icon}
      </span>
      <span className="text-text-tertiary w-10 shrink-0 text-sm">{label}</span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-sm leading-[1.5]',
            isWarning ? 'text-warning font-medium' : 'text-text-primary'
          )}
        >
          {value}
        </span>
        {note && <span className="text-text-tertiary text-xs leading-[1.5]">{note}</span>}
      </div>
    </div>
  )
}
