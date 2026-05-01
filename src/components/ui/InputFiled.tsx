import React from 'react'
import { Asterisk } from 'lucide-react'
import { cn } from '@/lib/utils' // shadcn/ui의 유틸 함수 (없으면 직접 클래스 병합)

interface InputGroupProps {
  title?: string
  description?: string
  showAsterisk?: boolean
  buttonText?: string
  onButtonClick?: () => void
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  maxLength?: number
  message?: string
}

const InputFiled = ({
  title,
  description,
  showAsterisk = false,
  buttonText,
  onButtonClick,
  maxLength = 10,
  message,
  ...inputProps
}: InputGroupProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {/* Label Area */}
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <div className="flex">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              {showAsterisk && (
                <Asterisk className="mt-0.5 h-3.5 w-3.5 text-rose-400" strokeWidth={2} />
              )}
            </div>
          )}
          {description && <p className="text-sm tracking-tight text-slate-500">{description}</p>}
        </div>
      )}

      {/* Input & Button Area */}
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <input
            className={cn(
              'border-var(--border-secondary) bg-var(--bg-secondary) h-12 w-full rounded-3xl border p-3 transition-all focus:ring-1 focus:ring-blue-100 focus:outline-none',
              'placeholder:text-sm placeholder:text-slate-300'
            )}
            {...inputProps}
          />
          {maxLength && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-300">
              {inputProps.value?.toString().length || 0}/{maxLength}
            </span>
          )}
        </div>

        {buttonText && (
          <button
            onClick={onButtonClick}
            className="h-12 cursor-pointer rounded-3xl bg-[#96CE71] px-4 py-2 text-[15px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#85ba63]"
          >
            {buttonText}
          </button>
        )}
      </div>
      {message && <p className={cn('')}>{message}</p>}
    </div>
  )
}

export default InputFiled
