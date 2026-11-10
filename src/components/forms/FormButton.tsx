import { useFormContext } from '#/hooks/demo.form-context'
import { Button } from '../ui/button'

export function FormButton({
  label,
  className,
  disabled = false,
}: {
  label: string
  className?: string
  disabled?: boolean
}) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          className={className}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}
