import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Image src="/images/logo-portadeentrada-white-low.png" alt="Porta de Entrada" width={150} height={60} />
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">Prefeitura da Cidade de São Paulo</p>
            <p className="text-sm text-gray-400">Secretaria Municipal de Cultura</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Porta de Entrada. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
