import type { ReactNode } from 'react'

// Figma 랜딩 시안(Landing/Web)의 아이콘 벡터를 24px 상자로 옮긴 것.
interface LandingIconProps {
  className?: string
}

const StrokeIcon = ({ className, children }: LandingIconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
)

export const DownloadIcon = ({ className }: LandingIconProps) => (
  <StrokeIcon className={className}>
    <path d="M12 4V15M16.5 10.5L12 15L7.5 10.5M5 20H19" />
  </StrokeIcon>
)

export const BellIcon = ({ className }: LandingIconProps) => (
  <StrokeIcon className={className}>
    <path d="M10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20M6 9C6 5.69 8.69 3 12 3C15.31 3 18 5.69 18 9C18 15 20.5 16.5 20.5 16.5H3.5C3.5 16.5 6 15 6 9Z" />
  </StrokeIcon>
)

export const GlobeIcon = ({ className }: LandingIconProps) => (
  <StrokeIcon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12H21M9.9 12C9.9 8.25 10.6 4.5 12 3C13.4 4.5 14.1 8.25 14.1 12C14.1 15.75 13.4 19.5 12 21C10.6 19.5 9.9 15.75 9.9 12Z" />
  </StrokeIcon>
)
