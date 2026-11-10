import { useFieldContext } from '#/hooks/demo.form-context'
import * as ShadcnSelect from '#/components/ui/select'
import { ErrorMessages } from './ErrorMessage'
import { useFieldStatus } from './TextField'
import { Label } from '../ui/label'
import { cn } from 'cn'

const NULL_VALUE = '__null__'

const errorSelectClasses =
  'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'

export function FormSelect({
  label,
  values,
  placeholder,
  nullable = false,
  nullLabel = 'NONE',
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
  nullable?: boolean
  nullLabel?: string
}) {
  const field = useFieldContext<string | null>()
  const { hasError, errors } = useFieldStatus(field)

  const radixValue =
    field.state.value === null
      ? nullable
        ? NULL_VALUE // null terpilih -> item "None" tampil
        : '' // tidak nullable -> placeholder
      : field.state.value

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
      <ShadcnSelect.Select
        name={field.name}
        value={radixValue}
        onValueChange={(raw) => {
          field.handleChange(raw === NULL_VALUE ? null : raw)
          field.handleBlur()
        }}
      >
        <ShadcnSelect.SelectTrigger
          className={cn(
            'w-full bg-input border border-border transition-all',
            hasError && errorSelectClasses,
          )}
        >
          <ShadcnSelect.SelectValue
            placeholder={placeholder ? placeholder : 'Select here'}
          />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent className="bg-background text-foreground">
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {nullable && (
              <ShadcnSelect.SelectItem
                value={NULL_VALUE}
                className="text-muted-foreground"
              >
                {nullLabel}
              </ShadcnSelect.SelectItem>
            )}

            {values.map((value) => (
              <ShadcnSelect.SelectItem
                key={value.value}
                value={value.value}
                className="text-foreground"
              >
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function FormSelectNumber({
  label,
  values,
  placeholder,
}: {
  label: string
  values: Array<{ label: string; value: number }>
  placeholder?: string
}) {
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
      <ShadcnSelect.Select
        name={field.name}
        value={String(field.state.value)}
        onValueChange={(value) => field.handleChange(Number(value))}
      >
        <ShadcnSelect.SelectTrigger
          className={cn(
            'w-full bg-input border border-border transition-all',
            hasError && errorSelectClasses,
          )}
        >
          <ShadcnSelect.SelectValue
            placeholder={placeholder ? placeholder : 'Select here'}
          />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent className="bg-background text-foreground">
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem
                key={value.value}
                value={String(value.value)}
                className="text-foreground"
              >
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
