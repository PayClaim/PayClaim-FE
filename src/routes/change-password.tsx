import { Card } from '#/components/ui/card'
import { changePasswordForm } from '#/features/auth/forms/forms'
import { getCurrentUser } from '#/features/auth/queries/queries'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/change-password')({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    try {
      await context.queryClient.ensureQueryData(getCurrentUser())
    } catch {
      // Belum login (mis. dari link email) -> login dulu, lalu kembali ke sini
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})

function RouteComponent() {
  const form = changePasswordForm()

  return (
    <main>
      <Card className="w-100 mx-auto mt-20">
        <div className="p-4">
          <h1 className="text-xl font-bold text-center">Change Password</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.AppField name="currentPassword">
              {(field) => (
                <field.TextField
                  type="password"
                  label="Current Password"
                  placeholder="Current password"
                  autoComplete="current-password"
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

            <form.AppForm>
              <form.FormButton className="w-full" label="Change Password" />
            </form.AppForm>
          </form>
        </div>
      </Card>
    </main>
  )
}
