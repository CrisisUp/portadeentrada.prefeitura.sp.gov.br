import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SessionProvider } from '@/components/SessionProvider'
import { ToastProvider } from '@/components/ToastProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Porta de Entrada – Prefeitura da Cidade de São Paulo',
  description: 'Portal cultural da Prefeitura de São Paulo',
  icons: {
    icon: '/images/favicon-32x32.png',
    apple: '/images/favicon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <SessionProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-inter focus:font-semibold"
            >
              Pular para o conteúdo principal
            </a>
            <Header />
            <main id="main-content" className="pt-[100px]" role="main">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
