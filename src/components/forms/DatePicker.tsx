import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { useFieldContext } from '#/hooks/demo.form-context'
import { Label } from '../ui/label'
import { useSelector } from '@tanstack/react-store'
import { ErrorMessages } from './ErrorMessage'

export function DatePicker({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  const field = useFieldContext<Date | undefined>()
  const errors = useSelector(field.store, (state) => state.meta.errors)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className="mb-2 text-sm font-semibold text-(--sea-ink)"
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
            className="justify-start font-normal w-full bg-input"
            aria-invalid={errors.length > 0}
          >
            {field.state.value
              ? field.state.value.toLocaleDateString()
              : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={field.state.value}
            defaultMonth={field.state.value}
            captionLayout="dropdown"
            onSelect={(date) => {
              field.handleChange(date)
              setOpen(false)
              field.handleBlur()
            }}
          />
        </PopoverContent>
      </Popover>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
