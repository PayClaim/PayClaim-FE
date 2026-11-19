import { cn } from 'cn'
import { Label } from '../ui/label'
import { useFieldContext } from '#/hooks/demo.form-context'
import { useFieldStatus } from './TextField'
import { ErrorMessages } from './ErrorMessage'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '#/components/ui/combobox'
import type { SelectOptionGroup } from './FormSelect'
import { useMemo } from 'react'

interface ComboboxProps {
  label: string
  values?: Array<{ label: string; value: string }>
  groups?: SelectOptionGroup[]
  placeholder?: string
  nullable?: boolean
  nullLabel?: string
  disabled?: boolean
  onCustomChange?: (val: string | null) => void
}
export function FormComboBox({
  label,
  groups,
  placeholder,
  //   nullable = false,
  //   nullLabel = 'NONE',
  //   disabled = false,
  //   onCustomChange,
}: ComboboxProps) {
  if (!groups) return null
  const field = useFieldContext<string>()
  const { hasError, errors } = useFieldStatus(field)
  const allAccounts = useMemo(() => groups.flatMap((g) => g.items), [groups])
  const selectedItem =
    allAccounts.find((i) => i.value === field.state.value) ?? null

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
      <Combobox
        onValueChange={(selected) => {
          field.handleChange(selected.value)
        }}
        value={selectedItem}
        items={groups}
        itemToStringLabel={(item: any) => item.label}
        itemToStringValue={(item: any) => item.value}
      >
        <ComboboxInput
          placeholder={placeholder ?? 'Select a participant'}
          aria-invalid={hasError}
          className={cn(
            'h-10 w-full rounded-md border border-border bg-input text-sm transition-all',
            hasError &&
              'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
          )}
        />
        <ComboboxContent>
          <ComboboxEmpty>No item found.</ComboboxEmpty>
          <ComboboxList>
            {(group, idx) => (
              <ComboboxGroup key={group.groupLabel} items={group.items}>
                <ComboboxLabel>{group.groupLabel}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                {idx < group.length - 1 && <ComboboxSeparator />}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
