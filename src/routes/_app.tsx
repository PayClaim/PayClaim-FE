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
      const user = await context.queryClient.query(getCurrentUser())
      const isAdmin = user.roles.includes('Admin')
      return {
        user,
        isAdmin,
      }
    } catch (err) {
      toast.error('User session not found, please login')
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
    to: '/approvals',
    label: 'Approvals',
    approverOnly: true,
  },
  {
    to: '/trip-proposals',
    label: 'Trip Proposals',
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
