import type { PhotoEntry } from '@/api/facades/generated/peakdaApi.schemas'

export function recordPhotoUrl(photo: PhotoEntry, size: 'thumbnail' | 'medium' | 'main'): string {
  return photo.variants?.[size] || photo.url
}
