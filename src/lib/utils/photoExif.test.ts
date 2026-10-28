import { describe, expect, it } from 'vitest'
import { readPhotoExif } from './photoExif'

function tiffWithDate(date: string): Uint8Array {
  const bytes = new Uint8Array(64)
  const view = new DataView(bytes.buffer)
  bytes.set([0x49, 0x49], 0)
  view.setUint16(2, 42, true)
  view.setUint32(4, 8, true)
  view.setUint16(8, 1, true)
  view.setUint16(10, 0x8769, true)
  view.setUint16(12, 4, true)
  view.setUint32(14, 1, true)
  view.setUint32(18, 26, true)
  view.setUint16(26, 1, true)
  view.setUint16(28, 0x9003, true)
  view.setUint16(30, 2, true)
  view.setUint32(32, 20, true)
  view.setUint32(36, 44, true)
  bytes.set(new TextEncoder().encode(date + '\0'), 44)
  return bytes
}

function jpegWithDate(date: string): File {
  const bytes = new Uint8Array(76)
  const view = new DataView(bytes.buffer)
  bytes.set([0xff, 0xd8, 0xff, 0xe1], 0)
  view.setUint16(4, 72)
  bytes.set([0x45, 0x78, 0x69, 0x66, 0, 0], 6)
  bytes.set(tiffWithDate(date), 12)
  return new File([bytes], 'photo.jpg', { type: 'image/jpeg' })
}

const ascii = (text: string) => new TextEncoder().encode(text)
const u16 = (value: number) => new Uint8Array([value >> 8, value & 0xff])
const u32 = (value: number) => {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value)
  return bytes
}
const concat = (...parts: Uint8Array[]) => {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    bytes.set(part, offset)
    offset += part.length
  }
  return bytes
}
const box = (type: string, ...parts: Uint8Array[]) => {
  const payload = concat(...parts)
  return concat(u32(8 + payload.length), ascii(type), payload)
}

// ftyp → meta(iinf: item 1 = Exif, iloc: item 1 at the mdat payload) → mdat(Exif item)
function heicWithDate(date: string, type = 'image/heic'): File {
  const exifItem = concat(u32(6), ascii('Exif\0\0'), tiffWithDate(date))
  const ftyp = box('ftyp', ascii('heic'), u32(0), ascii('mif1heic'))
  const iinf = box(
    'iinf',
    u32(0),
    u16(1),
    box('infe', new Uint8Array([2, 0, 0, 0]), u16(1), u16(0), ascii('Exif\0'))
  )
  const ilocFor = (exifOffset: number) =>
    box(
      'iloc',
      u32(0),
      new Uint8Array([0x44, 0x00]),
      u16(1),
      u16(1),
      u16(0),
      u16(1),
      u32(exifOffset),
      u32(exifItem.length)
    )
  const metaLength = box('meta', u32(0), iinf, ilocFor(0)).length
  const meta = box('meta', u32(0), iinf, ilocFor(ftyp.length + metaLength + 8))
  return new File([concat(ftyp, meta, box('mdat', exifItem))], 'photo.heic', { type })
}

describe('readPhotoExif', () => {
  it('reads the original capture date before image compression', async () => {
    expect(await readPhotoExif(jpegWithDate('2026:09:26 12:34:56'))).toEqual({
      date: '2026.09.26',
    })
  })

  it('reads the capture date from a HEIC exif item', async () => {
    expect(await readPhotoExif(heicWithDate('2026:10:24 15:30:00'))).toEqual({
      date: '2026.10.24',
    })
  })

  it('reads HEIC even when Android leaves the file type empty', async () => {
    expect(await readPhotoExif(heicWithDate('2026:10:24 15:30:00', ''))).toEqual({
      date: '2026.10.24',
    })
  })

  it('ignores unsupported image formats', async () => {
    expect(await readPhotoExif(new File([], 'photo.png', { type: 'image/png' }))).toEqual({})
  })
})
