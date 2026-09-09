interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'bordered'
  hover?: boolean
  className?: string
}

export default function Card({ children, variant = 'default', hover = false, className = '' }: CardProps) {
  const baseClasses = 'bg-surface rounded-xl p-6 transition-all duration-200'

  const variantClasses = {
    default: 'shadow-sm border border-line',
    elevated: 'shadow-lg',
    bordered: 'border border-line-dim',
  }

  const hoverClasses = hover ? 'hover-lift cursor-pointer' : ''

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}