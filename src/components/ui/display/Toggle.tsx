'use client'

import { useState } from 'react'

interface Props {
  initialStatus: boolean
  onChange?: (isOn: boolean) => void
}

export function Toggle({ initialStatus, onChange }: Props) {
  const [isOn, setIsOn] = useState(initialStatus)
  const onToggle = () => {
    setIsOn((prev) => {
      const next = !prev
      onChange?.(next)
      return next
    })
  }
  return (
    <button
      onClick={onToggle}
      type="button"
      className={`relative inline-flex h-7 w-15 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none ${
        isOn ? 'bg-primary' : 'bg-bg-quaternary'
      }`}
    >
      {/* 내부 원 (Handle) */}
      <span
        className={`inline-block h-5 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isOn ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
