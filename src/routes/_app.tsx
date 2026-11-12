import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import { getCurrentUser } from '#/features/auth/queries/queries'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app')({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.fetchQuery(getCurrentUser())
      const isAdmin =
        user.roles?.some((r: string) => r.toLowerCase() === 'admin') ?? false
      const isDirector =
        user.positionTitle?.toLowerCase() === 'director' ||
        user.positionId?.toLowerCase() === 'dir'
      return {
        user,
        isAdmin,
        isDirector,
      }
    } catch (err) {
      toast.error('Sesi masuk telah berakhir, silakan login kembali')
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  return (
    <div className="bg-background">
      <Sidebar className="fixed" />
      <div className="grow ms-75 min-h-screen pb-16">
        <Header />
        <div className="p-7.5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
