'use client'

import { useEffect, useRef, useState } from 'react'

interface MoreMenuProps {
  isOwner: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
}

export function MoreMenu({ isOwner, onEdit, onDelete, onReport }: MoreMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="더보기"
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-text-secondary hover:bg-bg-secondary"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 min-w-[100px] overflow-hidden rounded-xl border border-border-primary bg-white shadow-lg">
          {isOwner ? (
            <>
              <button
                onClick={() => {
                  onEdit?.()
                  setOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-bg-secondary"
              >
                수정하기
              </button>
              <button
                onClick={() => {
                  onDelete?.()
                  setOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-bg-secondary"
              >
                삭제하기
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onReport?.()
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-bg-secondary"
            >
              신고하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
