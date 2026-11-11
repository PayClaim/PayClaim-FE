import { useFieldContext } from '#/hooks/demo.form-context'
import { Label } from '../ui/label'
import { ErrorMessages } from './ErrorMessage'
import { useFieldStatus } from './TextField'
import { Textarea as ShadcnTextarea } from '#/components/ui/textarea'
import { cn } from 'cn'

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
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="mb-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(
          'bg-input border-border border transition-all',
          hasError &&
            'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20',
        )}
        placeholder={placeholder}
      />
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
