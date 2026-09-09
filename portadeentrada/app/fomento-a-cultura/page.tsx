import ProgramaPage from '@/components/ProgramaPage'

export default function FomentoACultura() {
  return (
    <ProgramaPage
      titulo="Fomento à Cultura"
      categoriaLabel="Editais Abertos"
      fallbackDescricao="Editais, chamamentos e oportunidades de financiamento para projetos culturais"
      fallbackConteudo={
        <>
          <p>A Secretaria Municipal de Cultura de São Paulo disponibiliza editais de fomento para apoiar a produção, circulação e fruição cultural na cidade.</p>
          <h2 className="font-inter font-semibold text-[28px] text-foreground mt-8 mb-4">Principais linhas de fomento</h2>
          <ul className="my-4 pl-6">
            <li className="my-2"><strong>PROMAC</strong> — Programa Municipal de Apoio a Projetos Culturais</li>
            <li className="my-2"><strong>Vai nas Escolas</strong> — Projetos culturais em unidades educacionais</li>
            <li className="my-2"><strong>Circuito Cultural</strong> — Circulação de espetáculos e atividades</li>
          </ul>
        </>
      }
    />
  )
}