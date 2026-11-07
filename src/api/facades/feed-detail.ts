import { getV2FeedById } from '@/api/facades/generated/feed-v2/feed-v2'

// Safe to import from a Server Component for metadata and initial HTML.
export async function feedDetailApi(id: number, options?: RequestInit) {
  const res = await getV2FeedById(id, options)
  return res.data.data ?? null
}
