'use client'

import { Button } from '@/components/ui/button/Button'
import { TermsForm } from '@/app/Terms/_components/TermsForm'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 필수 동의 여부를 폼과 제출 버튼이 공유해야 해서 둘을 한 클라이언트 컴포넌트로 묶는다.
export function TermsAgreement() {
  const router = useRouter()
  const [canSubmit, setCanSubmit] = useState(false)

  return (
    <>
      <div className="flex-1">
        <TermsForm onRequiredChange={setCanSubmit} />
      </div>
      <div className="absolute right-0 bottom-10 left-0 z-10 flex-1 p-4">
        <Button
          variant="filled"
          size="lg"
          disabled={!canSubmit}
          // replace: 가입을 마친 뒤 뒤로가기가 약관 화면으로 돌아가지 않게 한다
          onClick={() => router.replace('/profile')}
          className="bg-brand-secondary hover:bg-brand-secondary active:bg-brand-secondary w-full cursor-pointer text-white disabled:cursor-not-allowed"
        >
          동의하고 계속하기
        </Button>
      </div>
    </>
  )
}
