import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

// 기록 사진을 넘겨보는지만 알면 되므로 한 기록에서 처음 넘길 때 한 번만 보낸다(무료 한도 절약).
export function useTrackPhotoSwipe(
  selectedIndex: number,
  recordId: number,
  photoCount: number,
  surface: 'feed_list' | 'feed_detail'
) {
  const isTrackedRef = useRef(false)

  useEffect(() => {
    if (selectedIndex === 0 || isTrackedRef.current) return
    isTrackedRef.current = true
    track('feed_photo_swipe', { record_id: recordId, photo_count: photoCount, surface })
  }, [selectedIndex, recordId, photoCount, surface])
}
