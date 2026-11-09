import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getCurrentUser } from '#/features/auth/queries/queries'
import Footer from './Footer'

export interface TLink {
  to: string
  label: string
  adminOnly?: boolean
  employeeOnly?: boolean
}

export function Sidebar({
  className,
  links,
}: {
  className: string
  links: TLink[]
}) {
  const { data: user } = useQuery(getCurrentUser())
  const roles = user?.roles || []
  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isEmployee = roles.some((r) => r.toLowerCase() === 'employee')

  // Filter links berdasarkan role akun login
  const filteredLinks = links.filter((link) => {
    if (link.adminOnly && !isAdmin) return false
    if (link.employeeOnly && !isEmployee) return false
    return true
  })

  return (
    <div
      className={`bg-card border-r border-border p-2 min-h-screen w-75 flex flex-col gap-8 justify-between ${className}`}
    >
      <div className="min-h-20 bg-accent flex items-center justify-center rounded-xl font-bold text-lg text-primary">
        PayClaim
      </div>
      <div className="grow">
        {filteredLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="block my-1 font-bold text-sm hover:bg-(--hover-shadow) rounded-md w-full p-4"
            activeProps={{ className: 'bg-(--hover-shadow) text-primary' }}
          >
            {l.label}
          </Link>
        ))}

        <details className="relative w-full sm:w-auto mt-4">
          <summary className="block hover:bg-(--hover-shadow) rounded-2xl w-full p-4 text-xs font-semibold text-muted-foreground cursor-pointer">
            Demos & Debug
          </summary>
          <div className="mt-2 min-w-56 rounded-xl border border-border bg-card p-2 shadow-lg sm:absolute sm:right-0">
            <a
              href="/demo/tanstack-query"
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              TanStack Query
            </a>
            <a
              href="/demo/store"
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Store
            </a>
            <a
              href="/demo/form/simple"
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Simple Form
            </a>
            <a
              href="/demo/form/address"
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Address Form
            </a>
          </div>
        </details>
      </div>
      <Footer />
    </div>
  )
}
