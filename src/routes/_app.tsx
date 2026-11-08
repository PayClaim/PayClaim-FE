import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
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

const links = [
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
    label: 'Benefits',
  },
  // Admin
  {
    to: '/admin/benefits',
    label: 'Admin Benefits',
    admin: true,
  },
  {
    to: '/admin/benefit-categories',
    label: 'Benefits Categories',
    admin: true,
  },
  {
    to: '/admin/departments',
    label: 'Departments',
    admin: true,
  },
  {
    to: '/admin/employees',
    label: 'Employees',
    admin: true,
  },
  {
    to: '/admin/positions',
    label: 'Positions',
    admin: true,
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
