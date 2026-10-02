import { useEffect, useRef } from 'react'

// 사진 미리보기용 Object URL. 삭제·초기화 때 개별로 해제하고, 화면을 떠날 때 남은 URL 을 한꺼번에 해제한다.
export function usePreviewUrls() {
  const urlsRef = useRef(new Set<string>())
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false
    const urls = urlsRef.current
    return () => {
      isUnmountedRef.current = true
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const createPreviewUrl = (file: File) => {
    const url = URL.createObjectURL(file)
    urlsRef.current.add(url)
    return url
  }

  const revokePreviewUrl = (url: string) => {
    URL.revokeObjectURL(url)
    urlsRef.current.delete(url)
  }

  // 압축이 끝나기 전에 화면을 떠났으면 true — 그때는 새 URL 을 만들지 않는다.
  const isUnmounted = () => isUnmountedRef.current

  return { createPreviewUrl, revokePreviewUrl, isUnmounted }
}
