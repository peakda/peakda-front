import Header from '@/components/ui/Header'
import { ChevronLeft } from 'lucide-react'
export default function TermsPage() {
  return (
    <div className="relative w-full">
      <Header
        left={<ChevronLeft className=''/>}
        center={<div className="text-[15px] font-medium text-[#000000]">서비스 이용 동의</div>}
      />
    </div>
  )
}
