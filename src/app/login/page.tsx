import MainMessage from '@/components/ui/MainMessage'
import SocialLoginBtns from './_components/SocialLoginBtns'

export default function LoginPage() {
  return (
    <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center gap-10 px-4 pt-20">
      <div className="flex flex-2 items-center justify-center">
        <MainMessage />
      </div>
      <SocialLoginBtns />
    </div>
  )
}
