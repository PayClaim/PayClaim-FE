import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import type { TLink } from '#/components/Sidebar'
import { getCurrentUser } from '#/features/auth/queries/queries'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.query(getCurrentUser())
      return {
        user,
      }
    } catch (err) {
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
