import { useFieldContext } from '#/hooks/demo.form-context'
import { useSelector } from '@tanstack/react-store'
import { Label } from '../ui/label'
import { ErrorMessages } from './ErrorMessage'
import { Textarea as ShadcnTextarea } from '#/components/ui/textarea'

export function TextArea({
  label,
  rows = 3,
  placeholder,
}: {
  label: string
  rows?: number
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useSelector(field.store, (state) => state.meta.errors)

  return (
    <div className="mb-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        className="bg-input border-border border"
        placeholder={placeholder}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
