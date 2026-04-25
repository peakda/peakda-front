import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

type ButtonVariant = 'filled' | 'outlined' | 'ghost'
type ButtonSize = 'lg' | 'md' | 'sm'
type ButtonColor = 'primary' | 'default'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  color?: ButtonColor
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 font-medium rounded-full transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed select-none'

const SIZE: Record<ButtonSize, string> = {
  lg: 'h-12 px-6 text-base w-full',
  md: 'h-9  px-4 text-sm',
  sm: 'h-7  px-3 text-xs',
}

const VARIANT_COLOR: Record<ButtonVariant, Record<ButtonColor, string>> = {
  filled: {
    primary:
      'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:bg-green-200 disabled:text-white',
    default:
      'bg-gray-200 text-gray-500 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300',
  },
  outlined: {
    primary:
      'border border-green-500 text-green-600 hover:bg-green-50 active:bg-green-100 disabled:border-gray-200 disabled:text-gray-300',
    default:
      'border border-gray-300 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300',
  },
  ghost: {
    primary: 'text-green-600 hover:bg-green-50 active:bg-green-100 disabled:text-gray-300',
    default: 'text-gray-500 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300',
  },
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'outlined',
      size = 'md',
      color = 'default',
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(BASE, SIZE[size], VARIANT_COLOR[variant][color], className)}
        {...props}
      >
        {leftIcon && (
          <span className="flex items-center text-[1em]" aria-hidden>
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="flex items-center text-[1em]" aria-hidden>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonColor }
