import fs from 'fs'
import path from 'path'

// orval이 .generated-next 에 만든 결과를 generated/ 로 옮긴다.
// 내용이 같은 파일은 건드리지 않아서 매번 전체가 다시 써지는 걸 막는다.
const nextDir = './src/api/facades/.generated-next'
const targetDir = './src/api/facades/generated'

if (!fs.existsSync(nextDir)) {
  console.error(`${nextDir} not found. Did orval fail?`)
  process.exit(1)
}

function walk(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(dir, entry.name), path.join(base, entry.name))
      : [path.join(base, entry.name)]
  )
}

const nextFiles = walk(nextDir)
const currentFiles = fs.existsSync(targetDir) ? walk(targetDir) : []
const nextFileSet = new Set(nextFiles)

const added = []
const updated = []
const removed = []
let unchanged = 0

for (const rel of nextFiles) {
  const to = path.join(targetDir, rel)
  const content = fs.readFileSync(path.join(nextDir, rel))

  if (fs.existsSync(to)) {
    if (fs.readFileSync(to).equals(content)) {
      unchanged += 1
      continue
    }
    updated.push(rel)
  } else {
    added.push(rel)
  }

  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, content)
}

for (const rel of currentFiles) {
  if (nextFileSet.has(rel)) {
    continue
  }
  removed.push(rel)
  fs.rmSync(path.join(targetDir, rel))
}

// 태그가 통째로 사라져 빈 껍데기만 남은 디렉터리 정리.
// Windows 는 파일 삭제 반영이 늦어 readdir 로는 판정할 수 없어서 파일 목록으로 판단한다.
const survivingDirs = new Set(nextFiles.map((rel) => path.dirname(rel)))
for (const dir of new Set(removed.map((rel) => path.dirname(rel)))) {
  if (dir !== '.' && !survivingDirs.has(dir)) {
    remove(path.join(targetDir, dir))
  }
}

// 진단 출력은 fetch-swagger.mjs 와 동일하게 stderr 로 보낸다
const list = (label, files) => {
  if (files.length > 0) {
    console.error(`${label} (${files.length})`)
    files.forEach((f) => console.error(`  ${f}`))
  }
}

list('추가됨', added)
list('갱신됨', updated)
list('삭제됨 — 스웨거에서 사라진 API입니다. facade 확인 필요', removed)
console.error(`변경 없음 ${unchanged}개`)

// 임시 폴더 정리. Windows 에서 방금 생성된 파일은 삭제가 늦게 반영돼 ENOTEMPTY 가 나는데,
// 실패해도 생성 자체는 끝난 상태라 경고만 하고 넘어간다 (다음 orval 실행의 clean 이 지운다).
if (!remove(nextDir)) {
  console.warn(`\n${nextDir} 정리 실패 — 무시해도 됩니다. 다음 generate:api 때 정리됩니다.`)
}

function remove(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 20, retryDelay: 200 })
    return true
  } catch {
    return false
  }
}
