import { readStorage, removeStorage, writeStorage } from '@/lib/utils/storage'

const keyForUser = (userId: number) => `peakda:favorite-plants:${userId}`
const pendingKey = 'peakda:favorite-plants:pending-signup'

function readIds(key: string): number[] {
  try {
    const value: unknown = JSON.parse(readStorage(key) ?? '[]')
    return Array.isArray(value)
      ? value.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
      : []
  } catch {
    return []
  }
}

export function readCustomFavoritePlantIds(userId: number): number[] {
  const saved = readIds(keyForUser(userId))
  const pending = readIds(pendingKey)
  if (pending.length === 0) return saved
  const merged = [...new Set([...saved, ...pending])]
  writeStorage(keyForUser(userId), JSON.stringify(merged))
  removeStorage(pendingKey)
  return merged
}

export function saveCustomFavoritePlantIds(userId: number, ids: number[]): void {
  writeStorage(keyForUser(userId), JSON.stringify(ids))
}

export function savePendingCustomFavoritePlantIds(ids: number[]): void {
  writeStorage(pendingKey, JSON.stringify(ids))
}
