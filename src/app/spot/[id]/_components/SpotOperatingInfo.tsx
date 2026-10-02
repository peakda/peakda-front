import type { OperatingInfo } from '@/api/facades/generated/peakdaApi.schemas'

interface SpotOperatingInfoProps {
  info: OperatingInfo
}

// 관광공사 원문이라 줄바꿈(\n)이 섞여 오고 길이도 들쭉날쭉하다.
// 줄바꿈은 살리되 한 항목이 카드를 늘어뜨리지 않게 3줄에서 자른다.
export function SpotOperatingInfo({ info }: SpotOperatingInfoProps) {
  const rows = [
    { label: '운영 시간', value: info.operatingHours },
    { label: '입장료', value: info.admissionFee },
    { label: '주차', value: info.parking },
  ].filter((row) => row.value)
  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-text-primary text-base font-semibold">운영 정보</h2>
      <dl className="border-border-primary divide-border-primary divide-y rounded-xl border px-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4 py-3.5 text-sm">
            <dt className="text-text-secondary shrink-0">{label}</dt>
            <dd className="text-text-primary line-clamp-3 min-w-0 text-right break-words whitespace-pre-line">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
