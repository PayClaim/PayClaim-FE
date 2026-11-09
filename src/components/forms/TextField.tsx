import { useSelector } from '@tanstack/react-form'
import { useState } from 'react'
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
