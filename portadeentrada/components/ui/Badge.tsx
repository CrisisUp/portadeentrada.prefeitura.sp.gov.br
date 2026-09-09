interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'status' | 'category'
  className?: string
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const baseClasses = 'inline-block px-3 py-1 rounded-full text-xs font-semibold'

  const variantClasses = {
    primary: 'bg-primary text-white',
    status: '', // Uses dynamic colors from constants
    category: 'bg-primary text-white uppercase',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}