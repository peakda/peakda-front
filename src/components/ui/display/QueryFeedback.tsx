interface QueryFeedbackProps {
  state: 'loading' | 'error'
  onRetry?: () => void
}

export function QueryFeedback({ state, onRetry }: QueryFeedbackProps) {
  if (state === 'loading') {
    return (
      <p role="status" className="text-text-tertiary py-10 text-center text-sm">
        불러오는 중...
      </p>
    )
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-text-primary text-sm">
        데이터를 불러오지 못했어요. 연결 상태를 확인해주세요.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="border-border-primary rounded-xl border px-4 py-2 text-sm font-medium"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
