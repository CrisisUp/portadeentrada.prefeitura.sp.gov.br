import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, onBlur, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const [isFocused, setIsFocused] = useState(false)
    const [localError, setLocalError] = useState('')

    const displayError = error || localError

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      // Clear local error when user starts editing again
      if (displayError) {
        setLocalError('')
      }
      onBlur?.(e)
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    return (
      <div className="animate-fade-in">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-foreground-dim mb-1 font-inter"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 font-inter ${
            displayError
              ? 'border-red-300 bg-red-50'
              : isFocused
              ? 'border-primary bg-surface'
              : 'border-line-dim'
          } ${className}`}
          aria-describedby={displayError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={displayError ? 'true' : undefined}
          {...props}
        />
        <div className="min-h-[20px] mt-1">
          {displayError ? (
            <p
              id={`${inputId}-error`}
              className="text-sm text-red-600 font-inter animate-slide-in"
              role="alert"
            >
              {displayError}
            </p>
          ) : hint ? (
            <p
              id={`${inputId}-hint`}
              className="text-sm text-foreground-muted font-inter"
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input