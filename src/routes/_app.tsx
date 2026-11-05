import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import { getAuthUser } from '#/hooks/auth.hook'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    const user = getAuthUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { user }
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
      <div className="grow ms-[300px] min-h-screen pb-16">
        <Header />
        <div className="m-2">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
