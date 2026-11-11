import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { useFieldContext } from '#/hooks/demo.form-context'
import { Label } from '../ui/label'
import { ErrorMessages } from './ErrorMessage'
import { useFieldStatus } from './TextField'
import { fromDateOnly, toDateOnly } from '#/lib/utils'
import { cn } from 'cn'

export function DatePicker({
  label,
  minDate,
  maxDate,
  helperText,
}: {
  label: string
  minDate?: Date | string
  maxDate?: Date | string
  helperText?: string
}) {
  const [open, setOpen] = useState(false)
  const field = useFieldContext<string | undefined>()
  const { hasError, errors } = useFieldStatus(field)

  const minStr = minDate
    ? typeof minDate === 'string'
      ? minDate.slice(0, 10)
      : toDateOnly(minDate)
    : undefined

  const maxStr = maxDate
    ? typeof maxDate === 'string'
      ? maxDate.slice(0, 10)
      : toDateOnly(maxDate)
    : undefined

  const min = minStr ? fromDateOnly(minStr) : undefined
  const max = maxStr ? fromDateOnly(maxStr) : undefined

  const isOutOfRange = (date: Date) => {
    const s = toDateOnly(date)
    if (minStr && s < minStr) return true
    if (maxStr && s > maxStr) return true
    return false
  }

  const selected = field.state.value
    ? fromDateOnly(field.state.value)
    : undefined

  const initialMonth =
    selected && !isOutOfRange(selected) ? selected : min || new Date()

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
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) field.handleBlur()
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={label}
            className={cn(
              'justify-start font-normal w-full bg-input transition-all',
              hasError &&
                'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100',
            )}
            aria-invalid={hasError}
          >
            {field.state.value ? field.state.value : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={initialMonth}
            startMonth={min}
            endMonth={max}
            captionLayout="dropdown"
            disabled={minStr || maxStr ? isOutOfRange : undefined}
            onSelect={(date) => {
              if (!date) return
              if (isOutOfRange(date)) return
              field.handleChange(toDateOnly(date))
              setOpen(false)
              field.handleBlur()
            }}
          />
        </PopoverContent>
      </Popover>
      {helperText && !hasError && (
        <p className="mt-1 text-[11px] text-muted-foreground">{helperText}</p>
      )}
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
