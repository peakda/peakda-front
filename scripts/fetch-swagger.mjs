import fs from 'fs'

const SKIP_PATHS = []

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const res = await fetch(`${baseUrl}/v3/api-docs`)

if (!res.ok) {
  console.error(`Failed to fetch swagger: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const spec = await res.json()

for (const path of Object.keys(spec.paths ?? {})) {
  if (SKIP_PATHS.some((s) => path.includes(s))) {
    delete spec.paths[path]
  }
}

fs.writeFileSync('./swagger.json', JSON.stringify(spec, null, 2))
