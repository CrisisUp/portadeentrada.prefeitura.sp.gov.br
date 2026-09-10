import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Input from '@/components/ui/Input'

describe('Input Component', () => {
  it('renderiza input sem label', () => {
    render(<Input placeholder="Digite algo" />)
    expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument()
  })

  it('renderiza label quando fornecida', () => {
    render(<Input label="Nome Completo" />)
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument()
  })

  it('mostra asterisco vermelho quando required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toHaveClass('text-red-500')
  })

  it('mostra erro quando error prop é passado', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
    expect(screen.getByLabelText('Email')).toHaveClass('border-red-300')
    expect(screen.getByLabelText('Email')).toHaveClass('bg-red-50')
  })

  it('mostra hint quando hint prop é passado', () => {
    render(<Input label="Telefone" hint="Formato: (11) 99999-9999" />)
    expect(screen.getByText('Formato: (11) 99999-9999')).toBeInTheDocument()
  })

  it('aplica erro via aria-invalid e aria-describedby', () => {
    render(<Input label="Email" id="email" error="Email inválido" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('aplica hint via aria-describedby', () => {
    render(<Input label="Telefone" id="tel" hint="Dica" />)
    const input = screen.getByLabelText('Telefone')
    expect(input).toHaveAttribute('aria-describedby', 'tel-hint')
  })

  it('atualiza valor ao digitar', () => {
    render(<Input defaultValue="inicial" />)
    const input = screen.getByDisplayValue('inicial')
    fireEvent.change(input, { target: { value: 'novo valor' } })
    expect(input).toHaveDisplayValue('novo valor')
  })

  it('chama onChange ao digitar', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'teste' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('chama onBlur ao perder foco', () => {
    const handleBlur = vi.fn()
    render(<Input onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('limpa erro local ao digitar após erro', async () => {
    render(<Input label="Email" error="Email inválido" defaultValue="invalido" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'novo@email.com' } })

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('aplica classes de foco corretas', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(input).toHaveClass('focus:ring-2')
    expect(input).toHaveClass('focus:ring-primary')
    expect(input).toHaveClass('focus:border-transparent')
  })

  it('gera id automático a partir do label', () => {
    render(<Input label="Nome Completo" />)
    const input = screen.getByLabelText('Nome Completo')
    expect(input.id).toBe('nome-completo')
  })

  it('usa id prop quando fornecido', () => {
    render(<Input id="custom-id" label="Nome" />)
    const input = screen.getByLabelText('Nome')
    expect(input.id).toBe('custom-id')
  })

  it('aplica className customizada', () => {
    render(<Input className="custom-input-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input-class')
  })

  it('renderiza types diferentes', () => {
    const { rerender } = render(<Input type="text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="tel" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')

    rerender(<Input type="password" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')
  })

  it('propaga atributos extras (maxLength, autoComplete, etc)', () => {
    render(<Input maxLength={14} autoComplete="tel" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxlength', '14')
    expect(input).toHaveAttribute('autocomplete', 'tel')
  })

  it('estados visuais: default -> focus -> blur', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')

    // Default
    expect(input).toHaveClass('border-line-dim')

    // Focus
    fireEvent.focus(input)
    expect(input).toHaveClass('border-primary')
    expect(input).toHaveClass('bg-surface')

    // Blur
    fireEvent.blur(input)
    expect(input).toHaveClass('border-line-dim')
  })

  it('mantém erro do prop mesmo após blur', () => {
    render(<Input label="Email" error="Erro do prop" />)
    const input = screen.getByLabelText('Email')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(screen.getByRole('alert')).toHaveTextContent('Erro do prop')
  })
})