import { Card } from '#/components/ui/card'
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
    <main>
      <Card className="w-100 mx-auto mt-20">
        <div className="p-4">
          <h1 className="text-xl font-bold text-center">Wellcome to login</h1>
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
              <form.FormButton className="w-full" label="Submit" />
            </form.AppForm>
          </form>
        </div>
      </Card>
    </main>
  )
}
