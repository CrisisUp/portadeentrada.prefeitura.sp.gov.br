import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button Component', () => {
  it('renderiza botão com children', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument()
  })

  it('aplica variant primary por padrão', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-primary')
    expect(btn).toHaveClass('text-white')
  })

  it('aplica variant secondary', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-surface-muted')
  })

  it('aplica variant danger', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-red-600')
  })

  it('aplica variant success', () => {
    render(<Button variant="success">Success</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-green-600')
  })

  it('aplica variant ghost', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('text-primary')
  })

  it('aplica size sm', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('px-4')
    expect(btn).toHaveClass('py-2')
    expect(btn).toHaveClass('text-sm')
  })

  it('aplica size md por padrão', () => {
    render(<Button>Medium</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('px-6')
    expect(btn).toHaveClass('py-3')
  })

  it('aplica size lg', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('px-8')
    expect(btn).toHaveClass('py-4')
    expect(btn).toHaveClass('text-lg')
  })

  it('mostra loading state', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toContainHTML('Carregando...')
    expect(btn).toContainHTML('animate-spin')
  })

  it('desabilita botão quando disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('desabilita botão quando loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('chama onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('não chama onClick quando loading', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('aplica className customizada', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('tem btn-press class para efeito visual', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-press')
  })

  it('tem transition-all duration-200', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('transition-all')
    expect(screen.getByRole('button')).toHaveClass('duration-200')
  })
})