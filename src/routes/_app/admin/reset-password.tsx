import { resetPasswordForm } from '#/features/auth/forms/forms'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const form = resetPasswordForm()
  const { data: employees = [] } = useGetAllEmployeesQuery()

  // Backend menerima username atau email sebagai identifier akun
  const accountOptions = employees
    .filter((e) => e.isActive && e.email)
    .map((e) => ({
      label: `${e.fullName} (${e.number}) - ${e.email}`,
      value: e.email,
    }))

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-xs text-muted-foreground text-center mb-8">
        Set a new password for an employee account. The employee will be
        notified by email.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.AppField name="username">
          {(field) => (
            <field.FormSelect
              values={accountOptions}
              label="Account"
              placeholder="Select account"
            />
          )}
        </form.AppField>

        <form.AppField name="newPassword">
          {(field) => (
            <field.TextField
              type="password"
              label="New Password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          )}
        </form.AppField>

        <form.AppField name="confirmNewPassword">
          {(field) => (
            <field.TextField
              type="password"
              label="Confirm New Password"
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          )}
        </form.AppField>

        <div className="mt-6 flex justify-end">
          <form.AppForm>
            <form.FormButton label="Reset Password" className="bg-primary" />
          </form.AppForm>
        </div>
      </form>
    </main>
  )
}
