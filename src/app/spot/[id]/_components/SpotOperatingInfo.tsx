import type { OperatingInfo } from '@/api/facades/generated/peakdaApi.schemas'

interface SpotOperatingInfoProps {
  info: OperatingInfo
}

// 관광공사 원문이라 줄바꿈(\n)이 섞여 오고 길이도 들쭉날쭉하다.
// 줄 수를 자르면 운영 시간 마지막 줄에 붙어 오는 '쉬는 날'이 가려지므로 자르지 않는다.
// 짧은 값은 오른쪽에 붙고, 여러 줄로 넘어가면 왼쪽 정렬·어절 단위 줄바꿈으로 문단처럼 읽히게 한다.
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
            <dd className="text-text-primary min-w-0 text-left break-words break-keep whitespace-pre-line">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
