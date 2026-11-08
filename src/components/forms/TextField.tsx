import { useSelector } from '@tanstack/react-form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useFieldContext } from '#/hooks/demo.form-context'
import { ErrorMessages } from './ErrorMessage'

interface TextFieldProps {
  label: string
  placeholder?: string
}

export function TextField({ label, placeholder }: TextFieldProps) {
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
      <Input
        className="bg-input border border-border"
        type="text"
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
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
