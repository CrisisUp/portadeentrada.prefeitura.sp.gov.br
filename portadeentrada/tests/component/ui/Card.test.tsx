import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '@/components/ui/Card'

describe('Card Component', () => {
  it('renderiza children', () => {
    render(<Card>Conteúdo do card</Card>)
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument()
  })

  it('aplica variant default por padrão', () => {
    render(<Card data-testid="card">Default</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('bg-surface')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('p-6')
    expect(card).toHaveClass('shadow-sm')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('border-line')
  })

  it('aplica variant elevated', () => {
    render(<Card variant="elevated" data-testid="card">Elevated</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('shadow-lg')
    expect(card).not.toHaveClass('border-line')
  })

  it('aplica variant bordered', () => {
    render(<Card variant="bordered" data-testid="card">Bordered</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('border-line-dim')
    expect(card).not.toHaveClass('shadow-sm')
  })

  it('aplica hover quando hover=true', () => {
    render(<Card hover data-testid="card">Hoverable</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('hover-lift')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('não aplica hover quando hover=false (padrão)', () => {
    render(<Card data-testid="card">No hover</Card>)
    const card = screen.getByTestId('card')
    expect(card).not.toHaveClass('hover-lift')
    expect(card).not.toHaveClass('cursor-pointer')
  })

  it('aplica className customizada', () => {
    render(<Card className="custom-card-class" data-testid="card">Custom</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-card-class')
  })

  it('tem transition-all duration-200', () => {
    render(<Card data-testid="card">Test</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('transition-all')
    expect(card).toHaveClass('duration-200')
  })

  it('renderiza HTML complexo como children', () => {
    render(
      <Card>
        <h3 className="font-bold">Título</h3>
        <p>Descrição</p>
        <button className="btn">Ação</button>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ação/i })).toBeInTheDocument()
  })
})