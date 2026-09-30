import { MainMessage } from '@/components/ui/message/MainMessage'
import { AuthCallbackHandler } from '@/app/auth/callback/_components/AuthCallbackHandler'

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500">
      <MainMessage />
      <AuthCallbackHandler />
    </div>
  )
}
