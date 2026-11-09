import { useSelector } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from 'cn'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useFieldContext } from '#/hooks/demo.form-context'
import { ErrorMessages } from './ErrorMessage'

interface TextFieldProps {
  label: string
  placeholder?: string
  type?: string
  autoComplete?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  autoComplete,
  onKeyDown,
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  const field = useFieldContext<string>()
  const errors = useSelector(field.store, (state) => state.meta.errors)
  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          className={cn('bg-input border border-border', isPassword && 'pe-10')}
          type={effectiveType}
          autoComplete={autoComplete}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function NumberField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<number>()
  const errors = useSelector(field.store, (state) => state.meta.errors)
  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <Input
        type="number"
        className="bg-input border border-border"
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

interface CurrencyFieldProps {
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CurrencyField({
  label,
  placeholder = '0',
  disabled,
  className,
}: CurrencyFieldProps) {
  const field = useFieldContext<number>()
  const errors = useSelector(field.store, (state) => state.meta.errors)

  const formatDots = (n: number | null | undefined): string => {
    if (n === null || n === undefined || n === 0 || isNaN(n)) return ''
    return new Intl.NumberFormat('id-ID').format(n)
  }

  const [displayValue, setDisplayValue] = useState<string>(() =>
    formatDots(field.state.value),
  )

  useEffect(() => {
    const formatted = formatDots(field.state.value)
    if (field.state.value === 0 && displayValue === '') {
      return
    }
    if (formatted !== displayValue) {
      setDisplayValue(formatted)
    }
  }, [field.state.value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    if (!rawDigits) {
      setDisplayValue('')
      field.handleChange(0)
      return
    }

    const num = parseInt(rawDigits, 10)
    const formatted = new Intl.NumberFormat('id-ID').format(num)
    setDisplayValue(formatted)
    field.handleChange(num)
  }

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <div className="relative">
        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground font-semibold text-sm pointer-events-none select-none">
          Rp
        </span>
        <Input
          className={cn(
            'bg-input border border-border ps-10 font-medium',
            className,
          )}
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onBlur={field.handleBlur}
          onChange={handleInputChange}
        />
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function FileInput({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<File | null>()
  const errors = useSelector(field.store, (state) => state.meta.errors)
  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <Input
        className="bg-input border border-border"
        type="file"
        accept="image/*"
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          field.handleChange(file)
        }}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
