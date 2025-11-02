'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Erro de configuração do servidor.',
    AccessDenied: 'Acesso negado.',
    Verification: 'Token expirado ou já foi usado.',
    Default: 'Ocorreu um erro durante a autenticação.',
  }

  const message = error && error in errorMessages
    ? errorMessages[error]
    : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Erro de Autenticação</h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full">
            Voltar para Login
          </Button>
        </Link>
      </Card>
    </div>
  )
}
