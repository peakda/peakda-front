'use client'

import { useState } from 'react'

interface Props {
  initialStatus: boolean
  status?: boolean
  onChange?: (isOn: boolean) => void
}

export function Toggle({ initialStatus, status, onChange }: Props) {
  const [isOn, setIsOn] = useState(initialStatus)
  const currentStatus = status ?? isOn
  const onToggle = () => {
    if (status !== undefined) {
      onChange?.(!status)
      return
    }
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
        currentStatus ? 'bg-primary' : 'bg-bg-quaternary'
      }`}
    >
      {/* 내부 원 (Handle) */}
      <span
        className={`inline-block h-5 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          currentStatus ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
