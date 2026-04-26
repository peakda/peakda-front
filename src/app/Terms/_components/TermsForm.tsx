'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function TermsForm() {
  const [items, setItems] = useState([
    { id: 'age', label: '[필수] 이용약관 동의', checked: false },
    { id: 'service', label: '[필수] 개인정보 동의', checked: false },
    { id: 'privacy', label: '[선택] 마케팅푸시 동의', checked: false },
  ])

  // 전체 동의 핸들러
  const allChecked = items.every((item) => item.checked)
  const handleAllCheck = (checked: boolean) => {
    setItems(items.map((item) => ({ ...item, checked })))
  }

  // 개별 항목 핸들러
  const handleSingleCheck = (id: string, checked: boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked } : item)))
  }

  return (
    <div className="space-y-4 rounded-lg p-4">
      {/* 전체 동의 */}
      <div className="flex items-center space-x-2 border-b pb-2">
        <Checkbox
          id="all"
          checked={allChecked}
          onCheckedChange={handleAllCheck}
          className="rounded-sm"
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
            className="rounded-sm"
          />
          <label htmlFor={item.id} className="cursor-pointer text-base">
            {item.label}
          </label>
          <ChevronRight className="ml-auto cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>
      ))}
    </div>
  )
}
