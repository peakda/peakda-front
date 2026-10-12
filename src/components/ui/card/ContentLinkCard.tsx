'use client'

import { X } from 'lucide-react'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { useContentLinkMeta } from '@/hooks/useContentLinkMeta'
import { CONTENT_LINK_PLATFORM_LABEL, toDisplayUrl } from '@/lib/utils/contentLink'
import type { ContentLinkPlatform } from '@/api/facades/generated/peakdaApi.schemas'
import { cn } from '@/lib/utils/cn'

interface ContentLinkCardProps {
  url: string
  platform: ContentLinkPlatform
  // 있으면 우측 상단에 X 를 그린다(기록 작성·수정). 표시 화면은 넘기지 않아 읽기 전용이 된다.
  onRemove?: () => void
  className?: string
}

// 관련 콘텐츠 링크 미리보기 카드 (Figma SCR-018a).
// 본문을 누르면 원문을 새 창으로 연다 — 앱(Capacitor)에서는 시스템이 받아 외부 브라우저나
// 설치된 해당 앱(인스타그램·유튜브)으로 열린다. 축제 홈페이지·외부 알림 링크와 같은 방식이다.
export function ContentLinkCard({ url, platform, onRemove, className }: ContentLinkCardProps) {
  const { meta, isLoading } = useContentLinkMeta(url, platform)
  // 미지원 플랫폼은 플랫폼명 자리에 도메인을 보여 준다.
  const label =
    platform === 'UNSUPPORTED'
      ? toDisplayUrl(url).split(/[/?#]/)[0]
      : CONTENT_LINK_PLATFORM_LABEL[platform]

  return (
    <div
      className={cn(
        'bg-bg-primary border-border-primary flex flex-col gap-2 rounded-2xl border p-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-[#2d2d2d]">{label}</span>
        {onRemove && (
          <button type="button" aria-label="관련 콘텐츠 링크 삭제" onClick={onRemove}>
            <IconBtn className="bg-bg-quaternary-2 h-5 w-5 border-0 p-0">
              <X size={12} className="text-icon-primary-inverse" strokeWidth={2.5} />
            </IconBtn>
          </button>
        )}
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2">
        {isLoading ? (
          <span className="h-[18px] w-2/3 animate-pulse rounded bg-gray-200" />
        ) : (
          meta && (
            // Instagram 은 계정·본문이 붙어 있고, 블로그는 제목과 설명 사이를 조금 띄운다.
            <span className={cn('flex flex-col', platform === 'NAVER_BLOG' && 'gap-1')}>
              <span className="line-clamp-1 text-[13px] leading-[1.4] font-semibold tracking-[0.01em] text-[#2d2d2d]">
                {meta.title}
              </span>
              {meta.description && (
                <span
                  className={cn(
                    'line-clamp-1 text-[#2d2d2d]',
                    platform === 'INSTAGRAM'
                      ? 'text-[13px] leading-[1.4] font-semibold tracking-[0.01em]'
                      : 'text-xs leading-[1.4] tracking-[-0.02em]'
                  )}
                >
                  {meta.description}
                </span>
              )}
            </span>
          )
        )}
        <span className="truncate text-xs leading-[1.4] tracking-[-0.02em] text-green-700">
          {toDisplayUrl(url)}
        </span>
      </a>
    </div>
  )
}
