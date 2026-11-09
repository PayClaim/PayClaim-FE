import { useFormContext } from '#/hooks/demo.form-context'
import { Button } from '../ui/button'

export function FormButton({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting} className={className}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}
