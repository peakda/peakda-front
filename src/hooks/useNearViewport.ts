import { useEffect, useRef, useState } from 'react'

// 긴 목록 전체가 observer 하나를 공유한다. 화면 앞뒤 한 화면 정도를 미리 준비한다.
const listeners = new Map<Element, (visible: boolean) => void>()
let observer: IntersectionObserver | undefined

export function observeNearViewport(element: Element, callback: (visible: boolean) => void) {
  if (typeof IntersectionObserver === 'undefined') {
    callback(true)
    return () => {}
  }
  observer ??= new IntersectionObserver(
    (entries) => entries.forEach((entry) => listeners.get(entry.target)?.(entry.isIntersecting)),
    { rootMargin: '600px 0px' }
  )
  listeners.set(element, callback)
  observer.observe(element)
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    observer?.unobserve(element)
    listeners.delete(element)
    if (!listeners.size) {
      observer?.disconnect()
      observer = undefined
    }
  }
}

export function useNearViewport<T extends HTMLElement = HTMLDivElement>(once = true) {
  const ref = useRef<T>(null)
  const [isNear, setNear] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const subscription: { stop?: () => void } = {}
    subscription.stop = observeNearViewport(ref.current, (visible) => {
      setNear((previous) => (once ? previous || visible : visible))
      if (once && visible) subscription.stop?.()
    })
    return () => subscription.stop?.()
  }, [once])
  return { ref, isNear }
}
