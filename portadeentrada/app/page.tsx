import Banner from '@/components/Banner'
import NavigationCard from '@/components/NavigationCard'

const CARDS = [
  { href: '/fomento-a-cultura', image: '/images/home1.png', alt: 'Fomento à Cultura' },
  { href: '/programacao-cultural', image: '/images/home2-1.png', alt: 'Programação Cultural' },
  { href: '/formacao', image: '/images/home3.png', alt: 'Formação' },
  { href: '/promac', image: '/images/home4-1.png', alt: 'PROMAC' },
  { href: '/editais-para-oficinas', image: '/images/home5.png', alt: 'Editais para Oficinas' },
]

export default function Home() {
  return (
    <>
      <Banner />
      <section className="flex justify-around py-10 px-5">
        {CARDS.map(card => (
          <NavigationCard key={card.href} {...card} />
        ))}
      </section>
    </>
  )
}
