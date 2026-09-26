import { describe, expect, it } from 'vitest'
import { readPhotoExif } from './photoExif'

function jpegWithDate(date: string): File {
  const bytes = new Uint8Array(76)
  const view = new DataView(bytes.buffer)
  bytes.set([0xff, 0xd8, 0xff, 0xe1], 0)
  view.setUint16(4, 72)
  bytes.set([0x45, 0x78, 0x69, 0x66, 0, 0], 6)
  const tiff = 12
  bytes.set([0x49, 0x49], tiff)
  view.setUint16(tiff + 2, 42, true)
  view.setUint32(tiff + 4, 8, true)
  view.setUint16(tiff + 8, 1, true)
  view.setUint16(tiff + 10, 0x8769, true)
  view.setUint16(tiff + 12, 4, true)
  view.setUint32(tiff + 14, 1, true)
  view.setUint32(tiff + 18, 26, true)
  view.setUint16(tiff + 26, 1, true)
  view.setUint16(tiff + 28, 0x9003, true)
  view.setUint16(tiff + 30, 2, true)
  view.setUint32(tiff + 32, 20, true)
  view.setUint32(tiff + 36, 44, true)
  bytes.set(new TextEncoder().encode(date + '\0'), tiff + 44)
  return new File([bytes], 'photo.jpg', { type: 'image/jpeg' })
}

describe('readPhotoExif', () => {
  it('reads the original capture date before image compression', async () => {
    expect(await readPhotoExif(jpegWithDate('2026:09:26 12:34:56'))).toEqual({
      date: '2026.09.26',
    })
  })

  it('ignores unsupported image formats', async () => {
    expect(await readPhotoExif(new File([], 'photo.png', { type: 'image/png' }))).toEqual({})
  })
})
