import fs from 'fs'
import path from 'path'

const generatedDir = './src/api/generated'
const facadesDir = './src/api/facades'

if (!fs.existsSync(generatedDir)) {
  console.error('src/api/generated/ not found. Run pnpm generate:api first.')
  process.exit(1)
}

if (!fs.existsSync(facadesDir)) {
  fs.mkdirSync(facadesDir, { recursive: true })
}

const domains = fs
  .readdirSync(generatedDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

if (domains.length === 0) {
  process.exit(0)
}

for (const domain of domains) {
  const dest = path.join(facadesDir, `${domain}.ts`)
  if (fs.existsSync(dest)) {
    continue
  }
  fs.writeFileSync(
    dest,
    `// AUTO-GENERATED FACADE — 초기 1회만 생성됨. 이후 수동 유지.
// TODO: 아래 import를 실제 생성된 함수명으로 교체하세요
// import { someFunction } from "@/api/generated/${domain}/${domain}";

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)
// export async function exampleApi() {
//   const res = await someFunction();
//   return res.data.data ?? null;
// }
`
  )
}
