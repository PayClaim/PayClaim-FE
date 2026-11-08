import { useFieldContext } from '#/hooks/demo.form-context'
import { useSelector } from '@tanstack/react-store'
import * as ShadcnSelect from '#/components/ui/select'
import { ErrorMessages } from './ErrorMessage'
import { Label } from '../ui/label'

const NULL_VALUE = '__null__'

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
  const errors = useSelector(field.store, (state) => state.meta.errors)

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
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
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
        <ShadcnSelect.SelectTrigger className="w-full bg-input border border-border">
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
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
  const errors = useSelector(field.store, (state) => state.meta.errors)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
      >
        {label}
      </Label>
      <ShadcnSelect.Select
        name={field.name}
        value={String(field.state.value)}
        onValueChange={(value) => field.handleChange(Number(value))}
      >
        <ShadcnSelect.SelectTrigger className="w-full bg-input border border-border">
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
