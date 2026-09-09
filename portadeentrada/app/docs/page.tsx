'use client'

import dynamic from 'next/dynamic'
import { swaggerConfig } from '@/lib/swagger'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p>Carregando documentação...</p>,
})

import 'swagger-ui-react/swagger-ui.css'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="font-inter font-bold text-[42px] text-foreground mb-2">
          Porta de Entrada API
        </h1>
        <p className="font-inter text-foreground-dim mb-8">
          Documentação da API do portal cultural da Prefeitura de São Paulo
        </p>
        <div className="border rounded-lg overflow-hidden">
          <SwaggerUI spec={swaggerConfig} />
        </div>
      </div>
    </div>
  )
}
