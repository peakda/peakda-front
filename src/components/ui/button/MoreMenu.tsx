'use client'

import Image from 'next/image'
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
        className="text-text-secondary hover:bg-bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg leading-none"
      >
        <Image src={'/icons/more.svg'} alt="더보기" width={25} height={20} />
      </button>
      {open && (
        <div className="border-border-primary absolute top-9 right-0 z-20 min-w-[100px] overflow-hidden rounded-xl border bg-white shadow-lg">
          {isOwner ? (
            <>
              <button
                onClick={() => {
                  onEdit?.()
                  setOpen(false)
                }}
                className="text-text-primary hover:bg-bg-secondary w-full px-4 py-2.5 text-center text-sm"
              >
                수정
              </button>
              <button
                onClick={() => {
                  onDelete?.()
                  setOpen(false)
                }}
                className="hover:bg-bg-secondary w-full px-4 py-2.5 text-center text-sm text-red-500"
              >
                삭제
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onReport?.()
                setOpen(false)
              }}
              className="hover:bg-bg-secondary w-full px-4 py-2.5 text-center text-sm text-red-500"
            >
              신고하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
