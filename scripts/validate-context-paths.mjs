import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()
const ignoreDirs = new Set(['node_modules', '.git', '.next', '.claude'])

function findContextFiles(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue
      results.push(...findContextFiles(path.join(dir, entry.name)))
    } else if (entry.name === 'CLAUDE.md' || entry.name === 'AGENTS.md') {
      results.push(path.join(dir, entry.name))
    }
  }
  return results
}

function isPathLike(span) {
  if (!span.includes('/')) return false
  if (span.startsWith('@') || span.startsWith('http') || span.startsWith('#')) return false
  if (span.startsWith('/')) return false
  return /^[\w.\-/[\]*]+$/.test(span)
}

function pathExists(span, baseDir) {
  const clean = span.replace(/\/$/, '')
  for (const candidate of [path.join(baseDir, clean), path.join(repoRoot, clean)]) {
    if (candidate.includes('*')) {
      if (fs.existsSync(path.dirname(candidate))) return true
    } else if (fs.existsSync(candidate)) {
      return true
    }
  }
  return false
}

const contextFiles = findContextFiles(repoRoot)
const broken = []

for (const file of contextFiles) {
  const baseDir = path.dirname(file)
  const content = fs.readFileSync(file, 'utf-8')
  const spans = [...content.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])

  for (const span of spans) {
    if (!isPathLike(span)) continue
    if (!pathExists(span, baseDir)) {
      broken.push({ file: path.relative(repoRoot, file), span })
    }
  }
}

if (broken.length > 0) {
  console.error(`context path 검증 실패: 존재하지 않는 경로 ${broken.length}건\n`)
  for (const { file, span } of broken) {
    console.error(`  ${file}: \`${span}\``)
  }
  process.exit(1)
}

console.warn(`context path 검증 통과 (${contextFiles.length}개 문서 확인)`)
