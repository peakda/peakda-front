import { useEffect, useState } from 'react'

// 값이 delay(ms) 동안 멈추면 반영한다. 검색 입력을 API 요청으로 흘리기 전 완충용.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
