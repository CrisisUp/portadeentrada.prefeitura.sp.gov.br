'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4" suppressHydrationWarning>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="font-inter font-bold text-[42px] text-foreground mb-2">
          Ops! Algo deu errado
        </h1>
        <p className="font-inter text-foreground-dim mb-6">
          Ocorreu um erro inesperado. Tente recarregar a página.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}