import { getCurrentUser } from '#/features/auth/queries/queries'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(getCurrentUser())

    if (user.roles.find((v) => v === 'Admin')) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
