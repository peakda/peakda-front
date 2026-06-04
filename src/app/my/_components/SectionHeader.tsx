import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  action: string
  href?: string
}

export function SectionHeader({ title, action, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-text-primary text-lg font-bold">{title}</span>
      {href ? (
        <Link href={href} className="text-text-secondary cursor-pointer text-sm">
          {action}
        </Link>
      ) : (
        <button className="text-text-secondary cursor-pointer text-sm">{action}</button>
      )}
    </div>
  )
}
