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
}

const InputFiled = ({
  title,
  description,
  showAsterisk = false,
  buttonText,
  onButtonClick,
  maxLength = 10,
  ...inputProps
}: InputGroupProps) => {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      {/* Label Area */}
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <div className="flex">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {showAsterisk && (
                <Asterisk className="mt-0.5 h-3.5 w-3.5 text-rose-400" strokeWidth={2} />
              )}
            </div>
          )}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      )}

      {/* Input & Button Area */}
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <input
            className={cn(
              'h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all focus:ring-2 focus:ring-blue-100 focus:outline-none',
              'placeholder:text-slate-300'
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
            className="h-14 cursor-pointer rounded-2xl bg-[#96CE71] px-6 font-bold whitespace-nowrap text-white transition-colors hover:bg-[#85ba63]"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

export default InputFiled
