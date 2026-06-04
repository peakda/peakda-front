import Link from 'next/link'

interface ProfileStatsProps {
  recordCount: string
  followerCount: string
  followingCount: string
}

function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const content = (
    <>
      <span className="text-text-primary text-lg font-bold">{value}</span>
      <span className="text-text-secondary text-sm">{label}</span>
    </>
  )
  const className = 'flex flex-1 flex-col items-center gap-0.5'

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}

export function ProfileStats({ recordCount, followerCount, followingCount }: ProfileStatsProps) {
  return (
    <div className="px-4">
      <div className="bg-bg-tertiary flex items-center rounded-xl py-4">
        <Stat value={recordCount} label="기록" />
        <div className="h-8 w-px bg-gray-200" />
        <Stat value={followerCount} label="팔로워" href="/followers" />
        <div className="h-8 w-px bg-gray-200" />
        <Stat value={followingCount} label="팔로잉" href="/following" />
      </div>
    </div>
  )
}
