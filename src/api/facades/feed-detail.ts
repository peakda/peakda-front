import { getFeedById } from '@/api/facades/generated/feed/feed'

// Safe to import from a Server Component for metadata and initial HTML.
export async function feedDetailApi(id: number, options?: RequestInit) {
  const res = await getFeedById(id, options)
  return res.data.data ?? null
}
