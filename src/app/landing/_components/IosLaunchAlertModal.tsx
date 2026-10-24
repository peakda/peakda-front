'use client'

import { useState } from 'react'
import { CircleX, X } from 'lucide-react'
import { toast } from 'sonner'
import { isValidLaunchAlertEmail, useSubscribeLaunchAlert } from '@/api/facades/launch-alert'
import { Button } from '@/components/ui/button/Button'
import { Checkbox } from '@/components/ui/form/checkbox'
import { Input } from '@/components/ui/form/Input'
import { SITE_URL } from '@/constants/site'
import { getApiErrorMessage } from '@/lib/utils/apiError'
import { cn } from '@/lib/utils/cn'

interface IosLaunchAlertModalProps {
  onClose: () => void
}

const webLinkClass = 'mt-4 block text-center text-sm leading-[1.4] text-gray-600'

export function IosLaunchAlertModal({ onClose }: IosLaunchAlertModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-launch-alert-title"
        className="relative w-full max-w-90 rounded-2xl bg-white px-5 pt-12 pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="text-center">
            <h2
              id="ios-launch-alert-title"
              className="text-xl leading-[1.4] font-bold tracking-[-0.01em] text-gray-950"
            >
              출시되는 날,
              <br />
              가장 먼저 메일로 알려드릴게요!
            </h2>
            <p className="mt-3 text-[15px] leading-[1.5] text-gray-600">
              그동안은 웹 버전으로
              <br />
              PEAKDA를 먼저 만나볼 수 있어요.
            </p>
            <a
              href={SITE_URL}
              className="bg-brand-secondary mt-6 flex h-12 w-full items-center justify-center rounded-3xl text-[15px] font-medium text-white"
            >
              웹으로 PEAKDA 시작하기
            </a>
            <button
              type="button"
              onClick={onClose}
              className={cn(webLinkClass, 'mx-auto cursor-pointer')}
            >
              닫기
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit}>
            {/* 완료 화면은 시안에 X 가 없어 하단 "닫기"로만 닫는다 */}
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer text-gray-400"
            >
              <X className="size-6" />
            </button>
            <h2
              id="ios-launch-alert-title"
              className="text-center text-xl leading-[1.4] font-bold tracking-[-0.01em] text-gray-950"
            >
              iOS 앱은 준비 중이에요
            </h2>
            <p className="mt-2 text-center text-[15px] leading-[1.5] text-gray-600">
              이메일을 남겨 주시면 출시되는 날
              <br />
              가장 먼저 알려드려요.
            </p>

            <div className="mt-6">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                aria-label="이메일 주소"
                aria-invalid={showEmailError}
                aria-describedby={showEmailError ? 'ios-launch-alert-email-error' : undefined}
                placeholder="이메일 주소를 입력해 주세요"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className={cn(
                  'rounded-xl',
                  email ? 'bg-white' : 'border-transparent',
                  showEmailError && 'border-brand-warning focus:border-brand-warning'
                )}
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
                <p
                  id="ios-launch-alert-email-error"
                  className="text-brand-warning mt-1.5 text-[13px]"
                >
                  이메일 형식을 확인해 주세요
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-[1.6] text-gray-600">
              <p className="font-semibold text-gray-900">수집·이용 안내</p>
              <ul className="mt-1">
                <li>- 수집 항목: 이메일 주소</li>
                <li>- 이용 목적: 출시 안내 메일 발송</li>
                <li>- 보유 기간: 발송 후 지체 없이 파기</li>
              </ul>
            </div>

            {/* label 로 감싸면 form 안 Radix 의 숨은 input 까지 눌려 두 번 토글된다. TermsForm 처럼 htmlFor 로 잇는다 */}
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="ios-launch-alert-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                className="border border-solid border-gray-300 bg-white data-[state=checked]:border-transparent"
              />
              <label
                htmlFor="ios-launch-alert-consent"
                className="cursor-pointer text-sm text-gray-900"
              >
                출시 안내 메일 수신에 동의합니다.
              </label>
            </div>

            <Button
              type="submit"
              variant="filled"
              color="primary"
              size="lg"
              className="mt-5"
              disabled={!isEmailValid || !consent || isPending}
            >
              출시 알림 받기
            </Button>
            <a href={SITE_URL} className={webLinkClass}>
              웹 버전 먼저 써보기
            </a>
          </form>
        )}
      </div>
    </div>
  )
}
