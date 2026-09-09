'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Slide {
  src: string
  alt: string
  href: string
}

const slides: Slide[] = [
  {
    src: '/images/slide-programacao.png',
    alt: 'Programação Cultural',
    href: '/programacao-cultural',
  },
  {
    src: '/images/slide-formacao.png',
    alt: 'Programas de Formação',
    href: '/formacao',
  },
  {
    src: '/images/slide-editais.png',
    alt: 'Editais para Oficinas',
    href: '/editais-para-oficinas',
  },
  {
    src: '/images/slide-promac.png',
    alt: 'PROMAC',
    href: '/promac',
  },
  {
    src: '/images/slide-fomentos.png',
    alt: 'Fomentos',
    href: '/fomento-a-cultura',
  },
  {
    src: '/images/banner-virada-cultural.png',
    alt: 'Virada Cultural',
    href: '/virada-cultural',
  },
  {
    src: '/images/banner-2026-07.png',
    alt: 'Banner 2026',
    href: '/programacao-cultural',
  },
]

const SLIDE_INTERVAL = 5000

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_INTERVAL)
  }, [])

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Auto-slide effect
  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide()
  }, [startAutoSlide, stopAutoSlide])

  // Pause on hover/focus (WCAG 2.2.2)
  const handleMouseEnter = () => {
    setIsPaused(true)
    stopAutoSlide()
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    startAutoSlide()
  }

  const handleFocus = () => {
    setIsPaused(true)
    stopAutoSlide()
  }

  const handleBlur = () => {
    setIsPaused(false)
    startAutoSlide()
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    stopAutoSlide()
    if (!isPaused) {
      // Restart timer after manual navigation
      setTimeout(startAutoSlide, SLIDE_INTERVAL)
    }
  }

  return (
    <section
      className="w-full h-[85vh] overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-roledescription="carousel"
      aria-label="Programas culturais em destaque"
    >
      {slides.map((slide, index) => (
        <Link
          key={index}
          href={slide.href}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </Link>
      ))}
      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20" role="tablist" aria-label="Navegação dos slides">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${
              index === currentSlide
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
          />
        ))}
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium">
          ⏸ Pausado
        </div>
      )}
    </section>
  )
}