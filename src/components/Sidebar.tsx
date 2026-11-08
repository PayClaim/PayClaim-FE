import { Link } from '@tanstack/react-router'
import Footer from './Footer'

interface TLink {
  to: string
  label: string
  admin?: boolean
}

export function Sidebar({
  className,
  links,
}: {
  className: string
  links: TLink[]
}) {
  const isAdmin = true // contoh
  return (
    <div
      className={`bg-card border-r border-border p-2 min-h-screen w-75 flex flex-col gap-8 justify-between ${className}`}
    >
      <div className="min-h-20 bg-accent">Logo</div>
      <div className="grow">
        {links.map((l) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          return !l.admin || isAdmin ? (
            <Link
              key={l.to}
              to={l.to}
              className="block my-1 font-bold text-sm hover:bg-(--hover-shadow) rounded-md w-full p-4"
              activeProps={{ className: 'bg-(--hover-shadow) text-primary' }}
            >
              {l.label}
            </Link>
          ) : null
        })}
        <details className="relative w-full sm:w-auto">
          <summary className="block hover:bg-(--hover-shadow) rounded-2xl w-full p-4">
            Demos
          </summary>
          <div className="mt-2 min-w-56 rounded-xl border border-(--line) bg-(--header-bg) p-2 shadow-lg sm:absolute sm:right-0">
            <a
              href="/demo/tanstack-query"
              className="block rounded-lg px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-[var(--sea-ink)]"
            >
              TanStack Query
            </a>
            <a
              href="/demo/store"
              className="block rounded-lg px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-[var(--sea-ink)]"
            >
              Store
            </a>
            <a
              href="/demo/form/simple"
              className="block rounded-lg px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            >
              Simple Form
            </a>
            <a
              href="/demo/form/address"
              className="block rounded-lg px-3 py-2 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
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
