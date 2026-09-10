import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Skeleton, { CardSkeleton, TableRowSkeleton, FormSkeleton, StatsSkeleton, BadgeSkeleton, ImageSkeleton } from '@/components/ui/Skeleton'

describe('Skeleton Components', () => {
  describe('Skeleton base', () => {
    it('renderiza div com animate-pulse e bg-surface-muted', () => {
      render(<Skeleton className="h-10 w-20" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('bg-surface-muted')
      expect(skeleton).toHaveClass('rounded')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })

    it('aplica className customizada', () => {
      render(<Skeleton className="custom-skeleton" />)
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton')
    })
  })

  describe('CardSkeleton', () => {
    it('renderiza estrutura de card com título, descrição e badge', () => {
      render(<CardSkeleton />)
      // Get the first skeleton's parent (the card container)
      const skeletons = screen.getAllByTestId('skeleton')
      const container = skeletons[0].parentElement
      expect(container).toHaveClass('bg-surface')
      expect(container).toHaveClass('rounded-xl')
      expect(container).toHaveClass('shadow-sm')
      expect(container).toHaveClass('border')
      expect(container).toHaveClass('border-line')
      expect(container).toHaveClass('p-6')

      // Verifica elementos internos
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('TableRowSkeleton', () => {
    it('renderiza linha com 5 colunas por padrão', () => {
      render(<TableRowSkeleton />)
      const row = screen.getByRole('row')
      expect(row).toHaveClass('border-b')
      expect(row).toHaveClass('border-line')

      const cells = row.querySelectorAll('td')
      expect(cells.length).toBe(5)
    })

    it('aceita número customizado de colunas', () => {
      render(<TableRowSkeleton cols={3} />)
      const cells = screen.getByRole('row').querySelectorAll('td')
      expect(cells.length).toBe(3)
    })

    it('cada célula tem skeleton', () => {
      render(<TableRowSkeleton cols={2} />)
      const cells = screen.getByRole('row').querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.querySelector('[data-testid="skeleton"]')).toBeInTheDocument()
      })
    })
  })

  describe('FormSkeleton', () => {
    it('renderiza estrutura de formulário com 3 campos + botão', () => {
      render(<FormSkeleton />)
      // Find the space-y-6 container
      const container = screen.getAllByTestId('skeleton')[0].parentElement!.parentElement
      expect(container).toHaveClass('space-y-6')

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBe(7) // 3 labels + 3 inputs + 1 button
    })
  })

  describe('StatsSkeleton', () => {
    it('renderiza grid 4 colunas com cards', () => {
      render(<StatsSkeleton />)
      // Find the grid container
      const skeletons = screen.getAllByTestId('skeleton')
      const container = skeletons[0].parentElement!.parentElement!.parentElement
      expect(container).toHaveClass('grid')
      expect(container).toHaveClass('grid-cols-2')
      expect(container).toHaveClass('md:grid-cols-4')
      expect(container).toHaveClass('gap-4')

      // 4 cards
      const cards = container!.querySelectorAll('[class*="bg-surface"]')
      expect(cards.length).toBe(4)
    })
  })

  describe('BadgeSkeleton', () => {
    it('renderiza skeleton de badge', () => {
      render(<BadgeSkeleton />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('h-5')
      expect(skeleton).toHaveClass('w-16')
      expect(skeleton).toHaveClass('rounded-full')
    })
  })

  describe('ImageSkeleton', () => {
    it('renderiza placeholder de imagem com SVG', () => {
      render(<ImageSkeleton className="aspect-video" />)
      const container = screen.getByTestId('skeleton')
      expect(container).toHaveClass('bg-surface-muted')
      expect(container).toHaveClass('animate-pulse')
      expect(container).toHaveClass('aspect-video')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('aplica className customizada', () => {
      render(<ImageSkeleton className="custom-image-skeleton" />)
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-image-skeleton')
    })
  })
})