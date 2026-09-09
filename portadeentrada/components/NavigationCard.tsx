import Link from 'next/link'
import Image from 'next/image'

interface NavigationCardProps {
  href: string
  image: string
  alt: string
}

export default function NavigationCard({ href, image, alt }: NavigationCardProps) {
  return (
    <Link href={href} className="relative block w-full aspect-square hover:opacity-90 transition-opacity overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover"
      />
    </Link>
  )
}
