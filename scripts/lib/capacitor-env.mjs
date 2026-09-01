export function validateCapacitorServerUrl(serverUrl) {
  if (!serverUrl) {
    throw new Error('CAPACITOR_SERVER_URL is required for syncing, running, and building the Android app.')
  }

  let parsedUrl

  try {
    parsedUrl = new URL(serverUrl)
  } catch {
    throw new Error('CAPACITOR_SERVER_URL must be a valid absolute URL.')
  }

  if (parsedUrl.protocol !== 'https:' || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
    throw new Error('CAPACITOR_SERVER_URL must be an HTTPS origin without a path, query, or fragment.')
  }

  return parsedUrl.origin
}
