import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default tseslint.config(
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: '@/ 절대경로를 사용하세요.' }] },
      ],
    },
  },
  {
    // orval 생성 코드는 mutator·schemas 를 상대경로로 import 한다 (직접 수정 금지)
    files: ['src/api/facades/generated/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // 라우트 파일(page·layout 등)은 Next 가 default export 를 요구하므로 app/ 밖에서만 막는다.
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'named export 를 사용하세요.' },
      ],
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'android/**/build/**', 'next-env.d.ts'],
  }
)
