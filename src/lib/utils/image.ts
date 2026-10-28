// 업로드 전에 사진을 줄인다. 요즘 폰 사진은 4000px·3~8MB 인데 화면에서 쓰는 크기는
// 그보다 훨씬 작아, 원본 그대로 올리면 업로드 시간만 길어진다.
const MAX_EDGE = 1600
const QUALITY = 0.82

// HEIF 컨테이너의 ftyp 브랜드. heic-to 의 isHeic 와 같은 목록이다(판별만 하려고 3MB 라이브러리를 받지 않도록 직접 본다).
const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'])

/** HEIC 를 JPEG 로 바꾸지 못했다. 그대로 올리면 서버가 거부하므로 호출부는 이 사진을 빼야 한다. */
export class UnsupportedImageError extends Error {
  constructor() {
    super('지원하지 않는 이미지 형식입니다')
    this.name = 'UnsupportedImageError'
  }
}

/**
 * 여러 장을 한 장씩 차례로 압축한다.
 * 동시에 돌리면 4000px 원본 비트맵(장당 약 48MB)이 한꺼번에 메모리에 올라가 저사양 기기에서 탭이 죽을 수 있다.
 * 변환하지 못한 HEIC 는 결과에서 빠진다 — 호출부는 개수를 비교해 안내한다.
 */
export async function compressImages(files: File[]): Promise<File[]> {
  const result: File[] = []
  for (const file of files) {
    try {
      result.push(await compressImage(file))
    } catch (error) {
      if (!(error instanceof UnsupportedImageError)) throw error
    }
  }
  return result
}

/**
 * 긴 변을 MAX_EDGE 로 맞춘 JPEG 로 다시 인코딩한다.
 *
 * HEIC(갤럭시 '고효율 사진')는 서버가 디코드하지 않으므로 항상 JPEG 로 바꾼다. 안드로이드 WebView·Chrome 은
 * HEIC 를 디코드하지 못해 heic-to(libheif WASM)로 푼다. 아이폰 Safari 는 고를 때 이미 JPEG 로 바꿔 준다.
 * 바꾸지 못하면 UnsupportedImageError 를 던진다.
 *
 * 그 밖에는 다음 경우에 원본 File 을 그대로 돌려준다 — 줄이는 게 손해거나 불가능한 상황이다.
 * - 이미지가 아닌 파일
 * - 브라우저가 디코드하지 못하는 포맷
 * - 결과가 원본보다 크거나 같은 경우(이미 잘 압축된 파일)
 */
export async function compressImage(file: File): Promise<File> {
  // 안드로이드는 HEIC 의 type 을 빈 문자열로 줄 때가 있어 type 만 보고 거르면 안 된다.
  const heic = await isHeic(file)
  if (!heic && !file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    // EXIF 회전 정보를 반영해야 세로로 찍은 사진이 눕지 않는다.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    if (!heic) return file
    bitmap = await decodeHeic(file)
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      if (heic) throw new UnsupportedImageError()
      return file
    }

    // JPEG 에는 알파가 없다. 투명 PNG 를 그냥 그리면 검게 나오므로 흰 바탕을 깔고 그린다.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    )
    if (!blob) {
      if (heic) throw new UnsupportedImageError()
      return file
    }
    // HEIC 는 압축률이 좋아 JPEG 가 더 커질 수 있지만, 원본은 서버가 받지 않으므로 크기와 상관없이 바꾼다.
    if (!heic && blob.size >= file.size) return file

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } finally {
    bitmap.close()
  }
}

async function isHeic(file: File): Promise<boolean> {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  if (/\.hei[cf]$/i.test(file.name)) return true
  const head = new Uint8Array(await file.slice(4, 12).arrayBuffer())
  if (head.length < 8) return false
  const text = String.fromCharCode(...head)
  return text.startsWith('ftyp') && HEIC_BRANDS.has(text.slice(4))
}

// libheif 는 irot/imir(회전·반전)를 적용해 풀어 주므로 따로 돌리지 않는다.
async function decodeHeic(file: File): Promise<ImageBitmap> {
  try {
    const { heicTo } = await import('heic-to')
    return await heicTo({ blob: file, type: 'bitmap' })
  } catch (error) {
    console.error('HEIC 변환 실패', error)
    throw new UnsupportedImageError()
  }
}
