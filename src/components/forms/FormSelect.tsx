import * as React from 'react'
import { useFieldContext } from '#/hooks/demo.form-context'
import * as ShadcnSelect from '#/components/ui/select'
import { ErrorMessages } from './ErrorMessage'
import { useFieldStatus } from './TextField'
import { Label } from '../ui/label'
import { cn } from 'cn'

const NULL_VALUE = '__null__'

const errorSelectClasses =
  'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'

export interface SelectOptionGroup {
  groupLabel: string
  items: Array<{ label: string; value: string }>
}

export function FormSelect({
  label,
  values,
  groups,
  placeholder,
  nullable = false,
  nullLabel = 'NONE',
  disabled = false,
  onCustomChange,
}: {
  label: string
  values?: Array<{ label: string; value: string }>
  groups?: SelectOptionGroup[]
  placeholder?: string
  nullable?: boolean
  nullLabel?: string
  disabled?: boolean
  onCustomChange?: (val: string | null) => void
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
    <div className="my-2">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors block',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <ShadcnSelect.Select
        disabled={disabled}
        name={field.name}
        value={radixValue}
        onValueChange={(raw) => {
          const nextVal = raw === NULL_VALUE ? null : raw
          field.handleChange(nextVal)
          field.handleBlur()
          onCustomChange?.(nextVal)
        }}
      >
        <ShadcnSelect.SelectTrigger
          className={cn(
            'w-full bg-input border border-border transition-all h-10',
            hasError && errorSelectClasses,
          )}
        >
          <ShadcnSelect.SelectValue
            placeholder={placeholder ? placeholder : 'Select here'}
          />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent className="bg-background text-foreground max-h-72">
          {groups ? (
            <>
              {nullable && (
                <ShadcnSelect.SelectGroup>
                  <ShadcnSelect.SelectItem
                    value={NULL_VALUE}
                    className="text-muted-foreground"
                  >
                    {nullLabel}
                  </ShadcnSelect.SelectItem>
                </ShadcnSelect.SelectGroup>
              )}
              {groups.map((group, groupIdx) => (
                <React.Fragment key={group.groupLabel || groupIdx}>
                  {groupIdx > 0 && (
                    <ShadcnSelect.SelectSeparator className="my-1.5 border-t border-border/70" />
                  )}
                  <ShadcnSelect.SelectGroup>
                    <ShadcnSelect.SelectLabel className="px-2.5 py-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 bg-muted/30 rounded-xs mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{group.groupLabel}</span>
                    </ShadcnSelect.SelectLabel>
                    {group.items.map((item) => (
                      <ShadcnSelect.SelectItem
                        key={item.value}
                        value={item.value}
                        className="text-foreground pl-3 text-sm cursor-pointer"
                      >
                        {item.label}
                      </ShadcnSelect.SelectItem>
                    ))}
                  </ShadcnSelect.SelectGroup>
                </React.Fragment>
              ))}
            </>
          ) : (
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

              {values?.map((value) => (
                <ShadcnSelect.SelectItem
                  key={value.value}
                  value={value.value}
                  className="text-foreground text-sm cursor-pointer"
                >
                  {value.label}
                </ShadcnSelect.SelectItem>
              ))}
            </ShadcnSelect.SelectGroup>
          )}
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
