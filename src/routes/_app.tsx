import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import type { TLink } from '#/components/Sidebar'
import { getCurrentUser } from '#/features/auth/queries/queries'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app')({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.ensureQueryData(getCurrentUser())
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

const links: TLink[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
  },
  {
    to: '/claims',
    label: 'Claims',
  },
  {
    to: '/approvals/claims',
    label: 'Approvals',
    approverOnly: true,
  },
  {
    to: '/trip-proposals',
    label: 'My Trip Proposals',
  },
  {
    to: '/benefits',
    label: 'My Benefits',
    employeeOnly: true,
  },
  // Admin Only
  {
    to: '/admin/benefits',
    label: 'Benefits',
    adminOnly: true,
  },
  {
    to: '/admin/benefit-plans',
    label: 'Benefit Plans',
    adminOnly: true,
  },
  {
    to: '/admin/benefit-categories',
    label: 'Benefits Categories',
    adminOnly: true,
  },
  {
    to: '/admin/departments',
    label: 'Departments',
    adminOnly: true,
  },
  {
    to: '/admin/employees',
    label: 'Employees',
    adminOnly: true,
  },
  {
    to: '/admin/reset-password',
    label: 'Reset Password',
    adminOnly: true,
  },
]

function RouteComponent() {
  return (
    <div className="bg-background">
      <Sidebar links={links} className="fixed" />
      <div className="grow ms-75 min-h-screen pb-16">
        <Header />
        <div className="p-7.5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
