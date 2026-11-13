import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
} from '@tanstack/react-router'
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
      toast.error('Your session has expired, please sign in again')
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
  const matches = useMatches()
  const activePath = matches[matches.length - 1]?.pathname ?? 'root'

  return (
    <div className="bg-background">
      <Sidebar className="fixed" />
      <div className="grow ms-75 min-h-screen pb-16">
        <Header />
        <div key={activePath} className="p-7.5 page-flow-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
