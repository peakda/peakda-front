'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Textarea } from '@/components/ui/form/Textarea'
import { cn } from '@/lib/utils/cn'
import type { CreateReportRequestReason } from '@/api/facades/generated/peakdaApi.schemas'

const REPORT_REASONS: { value: CreateReportRequestReason; label: string }[] = [
  { value: 'SPAM', label: '스팸/광고' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠' },
  { value: 'HARASSMENT', label: '욕설/괴롭힘' },
  { value: 'ETC', label: '기타' },
]

interface ReportModalProps {
  onSubmit: (reason: CreateReportRequestReason, detail?: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ReportModal({ onSubmit, onCancel, isSubmitting = false }: ReportModalProps) {
  const [reason, setReason] = useState<CreateReportRequestReason | null>(null)
  const [detail, setDetail] = useState('')

  return (
    <div className="fixed inset-0 z-100 mx-auto flex max-w-[430px] items-center justify-center bg-black/40 px-4">
      <div className="w-full rounded-2xl bg-white p-5">
        <h2 className="text-text-primary text-lg font-semibold">신고하기</h2>
        <p className="text-text-tertiary mt-1 text-sm">신고 사유를 선택해주세요.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {REPORT_REASONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setReason(value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                reason === value
                  ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary font-medium'
                  : 'border-border-primary text-text-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Textarea
          className="mt-3 h-24"
          placeholder="상세 사유를 입력해주세요 (선택)"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={500}
        />

        <div className="mt-4 flex gap-2">
          <Button
            variant="outlined"
            size="lg"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="lg"
            className="flex-1"
            disabled={!reason || isSubmitting}
            onClick={() => reason && onSubmit(reason, detail.trim() || undefined)}
          >
            신고하기
          </Button>
        </div>
      </div>
    </div>
  )
}
