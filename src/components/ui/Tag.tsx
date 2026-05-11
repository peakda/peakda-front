interface TagProps {
  text: string
  className?: string
}

export default function Tag({ text, className = '' }: TagProps) {
  return (
    <div
      className={`rounded-full bg-pink-400 px-1.5 py-0.5 text-[11px] font-semibold text-white ${className}`}
    >
      {text}
    </div>
  )
}
