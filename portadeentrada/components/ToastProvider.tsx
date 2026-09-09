'use client'

import { Toaster } from 'sonner'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'font-inter',
            description: 'font-inter',
            actionButton: 'font-inter font-semibold',
            cancelButton: 'font-inter font-semibold',
          },
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
            boxShadow: '0 10px 40px var(--shadow-color)',
          },
        }}
      />
    </>
  )
}