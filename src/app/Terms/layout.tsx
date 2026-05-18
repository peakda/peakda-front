import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 이용 동의',
  description: '피크다 서비스 이용을 위한 약관에 동의해 주세요.',
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
