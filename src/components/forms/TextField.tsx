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
        className="bg-input"
        type="text"
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={errors.length > 0}
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
        className="bg-input"
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        aria-invalid={errors.length > 0}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
