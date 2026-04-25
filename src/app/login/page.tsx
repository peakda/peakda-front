import Button from '@/components/ui/Button'
import MainMessage from '@/components/ui/MainMessage'

export default function LoginPage() {
  return (
    <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center gap-10 px-8 pt-20">
      <div className="flex flex-2 items-center justify-center">
        <MainMessage />
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <Button size="lg" variant="filled" className="bg-black">
          애플 로그인
        </Button>
        <Button size="lg" color="primary" variant="filled">
          카카오 로그인
        </Button>
        <Button size="lg" color="primary" variant="filled">
          네이버 로그인
        </Button>
      </div>
    </div>
  )
}
