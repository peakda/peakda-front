'use client'

import { Checkbox } from '@/components/ui/form/checkbox'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TermsFormProps {
  onRequiredChange: (allRequiredChecked: boolean) => void
}

export function TermsForm({ onRequiredChange }: TermsFormProps) {
  const router = useRouter()
  const [items, setItems] = useState([
    {
      id: 'age',
      label: '[필수] 이용약관 동의',
      checked: false,
      required: true,
      slug: 'terms-of-service',
    },
    {
      id: 'service',
      label: '[필수] 개인정보 동의',
      checked: false,
      required: true,
      slug: 'privacy-policy',
    },
    {
      id: 'privacy',
      label: '[선택] 마케팅푸시 동의',
      checked: false,
      required: false,
      slug: 'marketing-push-consent',
    },
  ])

  const updateItems = (next: typeof items) => {
    setItems(next)
    onRequiredChange(next.filter((i) => i.required).every((i) => i.checked))
  }

  // 전체 동의 핸들러
  const allChecked = items.every((item) => item.checked)
  const handleAllCheck = (checked: boolean) => {
    updateItems(items.map((item) => ({ ...item, checked })))
  }

  // 개별 항목 핸들러
  const handleSingleCheck = (id: string, checked: boolean) => {
    updateItems(items.map((item) => (item.id === id ? { ...item, checked } : item)))
  }

  return (
    <div className="space-y-4 rounded-lg p-4">
      {/* 전체 동의 */}
      <div className="flex items-center space-x-2 border-b pb-2">
        <Checkbox
          id="all"
          checked={allChecked}
          onCheckedChange={handleAllCheck}
          className="rounded-md"
        />
        <label htmlFor="all" className="cursor-pointer font-bold">
          전체 동의
        </label>
      </div>

      {/* 개별 항목 */}
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Checkbox
            id={item.id}
            checked={item.checked}
            onCheckedChange={(checked: boolean) => handleSingleCheck(item.id, checked)}
            className="rounded-md"
          />
          <label htmlFor={item.id} className="text-text-primary cursor-pointer text-base">
            {item.label}
          </label>
          <ChevronRight
            onClick={() => router.push(`/Terms/${item.slug}`)}
            strokeWidth={1.2}
            className="text-icon-secondary ml-auto cursor-pointer transition-colors duration-200 hover:text-gray-600"
          />
        </div>
      ))}
    </div>
  )
}
