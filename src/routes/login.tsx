import { loginForm } from '#/features/auth/forms/forms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (s: { redirect?: string }) => {
    return {
      redirect: s.redirect as string | null,
    }
  },
})

function RouteComponent() {
  const form = loginForm()

  return (
    <div>
      Wellcome to login
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.AppField name="username">
          {(field) => (
            <field.TextField placeholder="Username" label="Username" />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.TextField placeholder="Password" label="Password" />
          )}
        </form.AppField>

        <form.AppForm>
          <form.FormButton label="submit" />
        </form.AppForm>
      </form>
    </div>
  )
}
