'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button/Button'
import { logoutApi } from '@/api/facades/auth'

interface Props {
  onClose: () => void
}

export function LogoutDrawerContent({ onClose }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      console.error('로그아웃 실패', e)
    }
    onClose()
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-1 px-5 pt-2 pb-8 text-center">
      <h2 className="text-text-primary text-lg font-bold">로그아웃 할까요?</h2>
      <p className="text-text-secondary mb-4 text-sm">다시 로그인하면 언제든 돌아올 수 있어요.</p>
      <Button variant="filled" color="primary" size="lg" className="w-full" onClick={handleLogout}>
        로그아웃
      </Button>
      <Button variant="ghost" color="default" size="lg" className="w-full" onClick={onClose}>
        취소
      </Button>
    </div>
  )
}
