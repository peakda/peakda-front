export interface PhotoExif {
  date?: string
}

const FTYP = 0x66747970
const META = 0x6d657461
const IINF = 0x69696e66
const INFE = 0x696e6665
const ILOC = 0x696c6f63
const EXIF = 0x45786966
const MAX_HEIF_EXIF_BYTES = 1024 * 1024

// Read metadata before canvas compression removes it. Unsupported formats have no EXIF result.
// The format is sniffed from bytes because Android may hand HEIC files over with an empty type.
export async function readPhotoExif(file: File): Promise<PhotoExif> {
  const bytes = new DataView(await file.slice(0, 256 * 1024).arrayBuffer())
  if (bytes.byteLength >= 12 && bytes.getUint32(4) === FTYP) return readHeifExif(file, bytes)
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

// HEIF (Galaxy/iPhone "high efficiency" photos) stores EXIF as a separate item.
// meta/iinf names the item, meta/iloc says where its bytes live in the file.
async function readHeifExif(file: File, head: DataView): Promise<PhotoExif> {
  const meta = findBox(head, 0, head.byteLength, META)
  if (!meta) return {}
  const children = meta.start + 4
  const iinf = findBox(head, children, meta.end, IINF)
  const iloc = findBox(head, children, meta.end, ILOC)
  if (!iinf || !iloc) return {}
  const itemId = findExifItemId(head, iinf)
  if (itemId === undefined) return {}
  const extent = findItemExtent(head, iloc, itemId)
  if (!extent || extent.length < 4 || extent.length > MAX_HEIF_EXIF_BYTES) return {}
  const exif = new DataView(
    await file.slice(extent.offset, extent.offset + extent.length).arrayBuffer()
  )
  if (exif.byteLength < 4) return {}
  // The item starts with the offset to the TIFF header, usually skipping an "Exif\0\0" prefix.
  let tiff = 4 + exif.getUint32(0)
  if (tiff + 6 <= exif.byteLength && exif.getUint32(tiff) === EXIF) tiff += 6
  return parseExif(exif, tiff, exif.byteLength)
}

interface Box {
  start: number
  end: number
}

// Returns the payload range of the first box of the given type between from and to.
function findBox(bytes: DataView, from: number, to: number, type: number): Box | undefined {
  let offset = from
  while (offset + 8 <= to) {
    let size = bytes.getUint32(offset)
    let header = 8
    if (size === 1) {
      if (offset + 16 > to) return undefined
      size = bytes.getUint32(offset + 8) * 2 ** 32 + bytes.getUint32(offset + 12)
      header = 16
    } else if (size === 0) {
      size = to - offset
    }
    if (size < header) return undefined
    if (bytes.getUint32(offset + 4) === type) {
      return { start: offset + header, end: Math.min(offset + size, to) }
    }
    offset += size
  }
  return undefined
}

function findExifItemId(bytes: DataView, iinf: Box): number | undefined {
  let offset = iinf.start + 4 + (bytes.getUint8(iinf.start) === 0 ? 2 : 4)
  while (offset < iinf.end) {
    const infe = findBox(bytes, offset, iinf.end, INFE)
    if (!infe) return undefined
    const version = bytes.getUint8(infe.start)
    // item_type only exists from infe version 2.
    if (version >= 2) {
      const idSize = version === 2 ? 2 : 4
      const id = readUint(bytes, infe.start + 4, idSize)
      if (
        infe.start + 4 + idSize + 6 <= infe.end &&
        bytes.getUint32(infe.start + 4 + idSize + 2) === EXIF
      ) {
        return id
      }
    }
    offset = infe.end
  }
  return undefined
}

function findItemExtent(
  bytes: DataView,
  iloc: Box,
  itemId: number
): { offset: number; length: number } | undefined {
  const version = bytes.getUint8(iloc.start)
  const offsetSize = bytes.getUint8(iloc.start + 4) >> 4
  const lengthSize = bytes.getUint8(iloc.start + 4) & 0xf
  const baseOffsetSize = bytes.getUint8(iloc.start + 5) >> 4
  const indexSize = version === 0 ? 0 : bytes.getUint8(iloc.start + 5) & 0xf
  const idSize = version < 2 ? 2 : 4
  let offset = iloc.start + 6
  const count = readUint(bytes, offset, idSize)
  offset += idSize
  for (let i = 0; i < count && offset < iloc.end; i++) {
    const id = readUint(bytes, offset, idSize)
    offset += idSize
    // construction_method 0 means the offsets point into the file itself.
    const method = version === 0 ? 0 : bytes.getUint16(offset) & 0xf
    if (version !== 0) offset += 2
    offset += 2
    const baseOffset = readUint(bytes, offset, baseOffsetSize)
    offset += baseOffsetSize
    const extentCount = bytes.getUint16(offset)
    offset += 2
    const extentOffset = offset + indexSize
    offset += extentCount * (indexSize + offsetSize + lengthSize)
    if (id !== itemId) continue
    if (method !== 0 || extentCount !== 1) return undefined
    return {
      offset: baseOffset + readUint(bytes, extentOffset, offsetSize),
      length: readUint(bytes, extentOffset + offsetSize, lengthSize),
    }
  }
  return undefined
}

function readUint(bytes: DataView, offset: number, size: number): number {
  if (size === 2) return bytes.getUint16(offset)
  if (size === 4) return bytes.getUint32(offset)
  if (size === 8) return bytes.getUint32(offset) * 2 ** 32 + bytes.getUint32(offset + 4)
  return 0
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
  const pointer = (entry?: number) => (entry && u16(entry + 2) === 4 ? u32(entry + 8) : undefined)
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
