interface Props {
  isLast: boolean
  handleSkip: () => void
}

export default function SkipButton({ isLast, handleSkip }: Props) {
  return (
    <div className="z-10 h-9 px-4 pt-1.5">
      {!isLast && (
        <button
          onClick={handleSkip}
          className="text-text-secondary cursor-pointer text-sm font-medium transition-colors"
        >
          건너뛰기
        </button>
      )}
    </div>
  )
}
