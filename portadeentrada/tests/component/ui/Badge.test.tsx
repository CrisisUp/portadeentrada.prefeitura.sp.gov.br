import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

describe('Badge Component', () => {
  it('renderiza children', () => {
    render(<Badge>Badge Text</Badge>)
    expect(screen.getByText('Badge Text')).toBeInTheDocument()
  })

  it('aplica variant primary por padrão', () => {
    render(<Badge>Primary</Badge>)
    const badge = screen.getByText('Primary')
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-white')
    expect(badge).toHaveClass('inline-block')
    expect(badge).toHaveClass('px-3')
    expect(badge).toHaveClass('py-1')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
  })

  it('aplica variant status (sem cor fixa)', () => {
    render(<Badge variant="status">Status</Badge>)
    const badge = screen.getByText('Status')
    expect(badge).not.toHaveClass('bg-primary')
    expect(badge).toHaveClass('inline-block')
  })

  it('aplica variant category (uppercase)', () => {
    render(<Badge variant="category">Category</Badge>)
    const badge = screen.getByText('Category')
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-white')
    expect(badge).toHaveClass('uppercase')
  })

  it('aplica className customizada', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('custom-badge')
  })

  it('renderiza ícones ou elementos complexos', () => {
    render(
      <Badge>
        <span className="flex items-center gap-1">
          <span>★</span>
          Premium
        </span>
      </Badge>
    )
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('★')).toBeInTheDocument()
  })
})