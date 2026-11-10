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
  disabled?: boolean
}

const errorInputClasses =
  'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'

export function useFieldStatus(field: any) {
  const isTouched = useSelector(field.store, (state: any) => state.meta.isTouched)
  const errors = useSelector(field.store, (state: any) => state.meta.errors)
  const errorMap = useSelector(field.store, (state: any) => state.meta.errorMap)
  const submissionAttempts = useSelector(
    field.form?.store || field.store,
    (state: any) => state.submissionAttempts ?? 0,
  )
  const hasError =
    Boolean(errors && errors.length > 0) &&
    Boolean(isTouched || submissionAttempts > 0 || errorMap?.onSubmit)
  return { hasError, errors: errors || [] }
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  autoComplete,
  onKeyDown,
  disabled = false,
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  const field = useFieldContext<string>()
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          className={cn(
            'bg-input border border-border transition-all',
            isPassword && 'pe-10',
            hasError && errorInputClasses,
          )}
          type={effectiveType}
          autoComplete={autoComplete}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
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
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function NumberField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<number>()
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <Input
        type="number"
        className={cn(
          'bg-input border border-border transition-all',
          hasError && errorInputClasses,
        )}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {hasError && <ErrorMessages errors={errors} />}
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
  const { hasError, errors } = useFieldStatus(field)

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
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <span
          className={cn(
            'absolute inset-y-0 start-0 flex items-center ps-3 font-semibold text-sm pointer-events-none select-none transition-colors',
            hasError ? 'text-rose-500' : 'text-muted-foreground',
          )}
        >
          Rp
        </span>
        <Input
          className={cn(
            'bg-input border border-border ps-10 font-medium transition-all',
            hasError && errorInputClasses,
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
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function FileInput({
  label,
  placeholder,
  accept = 'image/*,.pdf,application/pdf',
}: TextFieldProps & { accept?: string }) {
  const field = useFieldContext<File | null>()
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="my-2">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <Input
        className={cn(
          'bg-input border border-border py-1.5 transition-all',
          hasError && errorInputClasses,
        )}
        type="file"
        accept={accept}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          field.handleChange(file)
        }}
      />
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
