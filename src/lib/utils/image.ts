// 업로드 전에 사진을 줄인다. 요즘 폰 사진은 4000px·3~8MB 인데 화면에서 쓰는 크기는
// 그보다 훨씬 작아, 원본 그대로 올리면 업로드 시간만 길어진다.
const MAX_EDGE = 1600
const QUALITY = 0.82

/**
 * 긴 변을 MAX_EDGE 로 맞춘 JPEG 로 다시 인코딩한다.
 *
 * 다음 경우엔 원본 File 을 그대로 돌려준다 — 줄이는 게 손해거나 불가능한 상황이다.
 * - 이미지가 아닌 파일
 * - 브라우저가 디코드하지 못하는 포맷(HEIC 등)
 * - 결과가 원본보다 크거나 같은 경우(이미 잘 압축된 파일)
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    // EXIF 회전 정보를 반영해야 세로로 찍은 사진이 눕지 않는다.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    // JPEG 에는 알파가 없다. 투명 PNG 를 그냥 그리면 검게 나오므로 흰 바탕을 깔고 그린다.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    )
    if (!blob || blob.size >= file.size) return file

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } finally {
    bitmap.close()
  }
}
