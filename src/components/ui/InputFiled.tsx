import React from 'react'
import { Asterisk } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
  error?: string
  disabled?: boolean
}

const InputFiled = ({
  title,
  description,
  showAsterisk = false,
  buttonText,
  onButtonClick,
  maxLength = 9,
  message,
  error,
  disabled = false,
  value,
  onChange,
  ...inputProps
}: InputGroupProps) => {
  return (
    <div className="flex w-full flex-col gap-1">
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
          {description && (
            <p className="mb-0.5 text-sm tracking-tight text-[#4E5666]">{description}</p>
          )}
        </div>
      )}

      {/* Input & Button Area */}
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <input
            className={cn(
              'border-var(--border-primary) bg-var(--bg-secondary) h-12 w-full rounded-3xl border p-3 transition-all focus:ring-1 focus:ring-blue-100 focus:outline-none',
              'placeholder:text-sm placeholder:text-slate-300',
              error && 'border-rose-400 focus:ring-rose-100',
              disabled && 'bg-slate-100 text-slate-400'
            )}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            {...inputProps}
          />
          {maxLength && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-300">
              {value?.toString().length || 0}/{maxLength + 1}
            </span>
          )}
        </div>

        {buttonText && (
          <button
            onClick={onButtonClick}
            disabled={!value || value.length < 1}
            className="h-12 cursor-pointer rounded-3xl bg-[#96CE71] px-4 py-2 text-[15px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#85ba63] disabled:cursor-not-allowed disabled:bg-[#d0d4db]"
          >
            {buttonText}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {!error && message && <p className="text-sm text-[#4E5666]">{message}</p>}
    </div>
  )
}

export default InputFiled
