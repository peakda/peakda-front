import React from 'react'
import { Asterisk } from 'lucide-react'
import Input, { type BorderVariant } from './Input'

interface InputFiledProps {
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
  variant?: BorderVariant
}

const InputFiled = ({
  title,
  description,
  showAsterisk = false,
  buttonText,
  onButtonClick,
  maxLength,
  message,
  error,
  disabled = false,
  value,
  onChange,
  variant = 'secondary',
  placeholder,
}: InputFiledProps) => {
  return (
    <div className="flex w-full flex-col gap-1">
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

      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <Input
            variant={variant}
            error={!!error}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            disabled={disabled}
            placeholder={placeholder}
          />
          {maxLength && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-300">
              {value?.toString().length ?? 0}/{maxLength}
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
