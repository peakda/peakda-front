// 진입 화면에서 다른 경로로 보낼 때 링크의 utm_* 를 이어 붙인다. Mixpanel 은 페이지 load 뒤에 시작하면서
// 그때의 주소에서 UTM 을 읽으므로, 그 전에 주소가 바뀌면 유입 경로가 '직접 유입'으로 잡힌다.
export const withUtmParams = (path: string, search: string): string => {
  const utm = new URLSearchParams()
  new URLSearchParams(search).forEach((value, key) => {
    if (key.startsWith('utm_')) utm.append(key, value)
  })
  const query = utm.toString()
  if (!query) return path
  return `${path}${path.includes('?') ? '&' : '?'}${query}`
}
