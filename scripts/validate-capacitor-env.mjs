const serverUrl = process.env.CAPACITOR_SERVER_URL

if (!serverUrl) {
  console.error('CAPACITOR_SERVER_URL is required for syncing, running, and building the Android app.')
  process.exit(1)
}

let parsedUrl

try {
  parsedUrl = new URL(serverUrl)
} catch {
  console.error('CAPACITOR_SERVER_URL must be a valid absolute URL.')
  process.exit(1)
}

if (parsedUrl.protocol !== 'https:' || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
  console.error('CAPACITOR_SERVER_URL must be an HTTPS origin without a path, query, or fragment.')
  process.exit(1)
}
