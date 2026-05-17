interface FilterProps {
  title: string
  subTitle: string
  isActive?: boolean
  onClick?: () => void
}

export default function FilterCard({ title, subTitle, isActive = false, onClick }: FilterProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-lg border p-3 transition-colors ${
        isActive ? 'border-primary bg-pink-50' : 'border-border-primary'
      } `}
    >
      <p className="text-text-primary text-sm font-medium">{title}</p>
      <p className="text-text-tertiary text-[13px] font-normal">{subTitle}</p>
    </button>
  )
}
