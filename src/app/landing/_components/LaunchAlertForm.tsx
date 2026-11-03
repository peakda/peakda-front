'use client'

import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import { toast } from 'sonner'
import { isValidLaunchAlertEmail, useSubscribeLaunchAlert } from '@/api/facades/launch-alert'
import { Checkbox } from '@/components/ui/form/checkbox'
import { Input } from '@/components/ui/form/Input'
import { SITE_URL } from '@/constants/site'
import { getApiErrorMessage } from '@/lib/utils/apiError'
import { cn } from '@/lib/utils/cn'

// 랜딩 '알림 신청' 섹션의 iOS 출시 알림 폼. 신청하면 시안의 Form/success 로 바뀐다.
export const LaunchAlertForm = () => {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  // 입력 중에는 형식 오류를 띄우지 않고, 한 번 벗어난 뒤부터 보여 준다
  const [touched, setTouched] = useState(false)
  const { mutate, isPending, isSuccess } = useSubscribeLaunchAlert()

  const trimmedEmail = email.trim()
  const isEmailValid = isValidLaunchAlertEmail(trimmedEmail)
  const showEmailError = touched && trimmedEmail.length > 0 && !isEmailValid

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isEmailValid || !consent || isPending) return
    mutate(
      { platform: 'IOS', email: trimmedEmail, privacyConsent: true },
      {
        onError: (error) =>
          toast.error(
            getApiErrorMessage(error) ?? '신청하지 못했어요. 잠시 후 다시 시도해 주세요.'
          ),
      }
    )
  }

  if (isSuccess) {
    return (
      <div role="status" className="flex flex-col gap-2.5 rounded-4xl bg-green-50 p-[18px]">
        <p className="flex items-start gap-2 text-[15px] leading-normal font-semibold text-gray-900">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-green-500" />
          신청했어요. 출시되는 날 가장 먼저 알려드릴게요.
        </p>
        <a href={SITE_URL} className="text-sm leading-normal font-bold text-green-600">
          지금 웹 버전 열기 →
        </a>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-5xl flex flex-col gap-4 bg-white p-6"
    >
      <h3 className="text-lg leading-[1.3] font-bold tracking-[-0.02em] text-gray-900">
        출시 알림 받기
      </h3>

      <div>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="이메일 주소"
          aria-invalid={showEmailError}
          aria-describedby={showEmailError ? 'launch-alert-email-error' : undefined}
          placeholder="이메일 주소를 입력해 주세요"
          value={email}
          maxLength={254}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          className={cn(showEmailError && 'border-brand-warning focus:border-brand-warning')}
          rightIcon={
            email && (
              <button
                type="button"
                aria-label="이메일 지우기"
                onClick={() => setEmail('')}
                className="flex cursor-pointer items-center"
              >
                <CircleX className="size-5 fill-gray-400 text-white" />
              </button>
            )
          }
        />
        {showEmailError && (
          <p id="launch-alert-email-error" className="text-brand-warning mt-1.5 text-[13px]">
            이메일 형식을 확인해 주세요
          </p>
        )}
      </div>

      {/* label 로 감싸면 form 안 Radix 의 숨은 input 까지 눌려 두 번 토글된다. htmlFor 로 잇는다 */}
      <div className="flex items-start gap-2.5">
        <Checkbox
          id="launch-alert-consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className="rounded-md border-[1.5px] border-solid border-gray-300 bg-white data-[state=checked]:border-transparent"
        />
        <label
          htmlFor="launch-alert-consent"
          className="cursor-pointer text-[13px] leading-normal text-gray-700"
        >
          [필수] 출시 안내 메일 수신과 개인정보 수집·이용에 동의해요
        </label>
      </div>

      <button
        type="submit"
        disabled={!isEmailValid || !consent || isPending}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-3xl bg-green-300 text-[15px] leading-[1.4] font-medium text-gray-50 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        출시 알림 받기
      </button>
      <p className="text-xs leading-normal text-gray-500">
        출시 안내 발송 후 지체 없이 파기해요. 메일마다 수신 거부 링크가 들어 있어요.
      </p>
    </form>
  )
}
