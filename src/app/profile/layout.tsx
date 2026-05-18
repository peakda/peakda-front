import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프로필 설정',
  description: '피크다에서 사용할 닉네임과 관심 꽃을 설정하세요.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
