export interface PhotoExif {
  date?: string
}

// Read metadata before canvas compression removes it. Unsupported formats have no EXIF result.
export async function readPhotoExif(file: File): Promise<PhotoExif> {
  if (file.type !== 'image/jpeg') return {}
  const bytes = new DataView(await file.slice(0, 256 * 1024).arrayBuffer())
  if (bytes.byteLength < 4 || bytes.getUint16(0) !== 0xffd8) return {}
  let marker = 2
  while (marker + 12 <= bytes.byteLength) {
    if (bytes.getUint8(marker) !== 0xff) break
    const kind = bytes.getUint8(marker + 1)
    if (kind === 0xda || kind === 0xd9) break
    const length = bytes.getUint16(marker + 2)
    if (length < 2 || marker + 2 + length > bytes.byteLength) break
    if (kind === 0xe1 && bytes.getUint32(marker + 4) === 0x45786966) {
      return parseExif(bytes, marker + 10, marker + 2 + length)
    }
    marker += 2 + length
  }
  return {}
}

function parseExif(bytes: DataView, start: number, end: number): PhotoExif {
  if (start + 8 > end) return {}
  const order = bytes.getUint16(start)
  if (order !== 0x4949 && order !== 0x4d4d) return {}
  const little = order === 0x4949
  const valid = (offset: number, size: number) => offset >= start && offset + size <= end
  const u16 = (offset: number) => bytes.getUint16(offset, little)
  const u32 = (offset: number) => bytes.getUint32(offset, little)
  if (u16(start + 2) !== 42) return {}
  const entries = (relative: number) => {
    const offset = start + relative
    const result = new Map<number, number>()
    if (!valid(offset, 2)) return result
    const count = Math.min(u16(offset), 128)
    if (!valid(offset + 2, count * 12)) return result
    for (let i = 0; i < count; i++) result.set(u16(offset + 2 + i * 12), offset + 2 + i * 12)
    return result
  }
  const pointer = (entry?: number) => entry && u16(entry + 2) === 4 ? u32(entry + 8) : undefined
  const data = (entry?: number) => {
    if (!entry) return undefined
    const type = u16(entry + 2)
    const count = u32(entry + 4)
    const size = count * (type === 5 ? 8 : type === 3 ? 2 : 1)
    if (!Number.isSafeInteger(size) || size > 1024) return undefined
    const offset = size <= 4 ? entry + 8 : start + u32(entry + 8)
    return valid(offset, size) ? { offset, count, type } : undefined
  }
  const ascii = (entry?: number) => {
    const value = data(entry)
    if (!value || value.type !== 2) return undefined
    let result = ''
    for (let i = 0; i < value.count && bytes.getUint8(value.offset + i); i++) {
      result += String.fromCharCode(bytes.getUint8(value.offset + i))
    }
    return result
  }
  const root = entries(u32(start + 4))
  const exif = entries(pointer(root.get(0x8769)) ?? 0)
  const rawDate = ascii(exif.get(0x9003)) ?? ascii(root.get(0x0132))
  const match = rawDate?.match(/^(\d{4}):(\d{2}):(\d{2})/)
  return {
    date: match ? [match[1], match[2], match[3]].join('.') : undefined,
  }
}
