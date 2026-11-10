import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from '@tanstack/react-router'
import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  Plane,
  Gift,
  Layers,
  Tags,
  Building2,
  Users,
  KeyRound,
  Terminal,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import type { ComponentType } from 'react'
import { cn } from 'cn'

export interface TLink {
  to: string
  label: string
  adminOnly?: boolean
  employeeOnly?: boolean
  approverOnly?: boolean
}

interface MenuItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  adminOnly?: boolean
  employeeOnly?: boolean
  approverOnly?: boolean
  resolveTo?: (isAdmin: boolean, isEmployee: boolean) => string
}

interface MenuCategory {
  title: string
  items: MenuItem[]
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'General',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Reimbursement & Trips',
    items: [
      {
        label: 'Claims',
        to: '/claims',
        icon: Receipt,
      },
      {
        label: 'Approvals',
        to: '/approvals',
        icon: CheckCircle2,
        approverOnly: true,
      },
      {
        label: 'Trip Proposals',
        to: '/trip-proposals',
        icon: Plane,
      },
    ],
  },
  {
    title: 'Benefits Management',
    items: [
      {
        label: 'Benefits',
        to: '/benefits',
        icon: Gift,
        resolveTo: (isAdmin) => (isAdmin ? '/admin/benefits' : '/benefits'),
      },
      {
        label: 'Benefit Plans',
        to: '/admin/benefit-plans',
        icon: Layers,
        adminOnly: true,
      },
      {
        label: 'Benefits Categories',
        to: '/admin/benefit-categories',
        icon: Tags,
        adminOnly: true,
      },
    ],
  },
  {
    title: 'Organization',
    items: [
      {
        label: 'Departments',
        to: '/admin/departments',
        icon: Building2,
        adminOnly: true,
      },
      {
        label: 'Employees',
        to: '/admin/employees',
        icon: Users,
        adminOnly: true,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Reset Password',
        to: '/admin/reset-password',
        icon: KeyRound,
        adminOnly: true,
      },
    ],
  },
]

export function Sidebar({
  className = '',
}: {
  className?: string
  links?: TLink[]
}) {
  const { pathname } = useLocation()
  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles || []
  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isEmployee = roles.some((r) => r.toLowerCase() === 'employee')
  const isApprover = roles.some((r) =>
    ['admin', 'manager', 'finance', 'finance manager'].includes(r.toLowerCase()),
  )

  const isItemActive = (targetPath: string) => {
    if (targetPath === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`)
  }

  const isDemoActive = pathname.startsWith('/demo')

  return (
    <aside
      className={cn(
        'w-75 h-screen bg-slate-50/70 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between backdrop-blur-sm z-30 select-none',
        className,
      )}
    >
      {/* Brand Header (Pojok Kiri Atas) */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shadow-2xs shrink-0">
          <img
            src="/logo-mii.png"
            alt="Mitra Integrasi Informatika"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
          PayClaim
        </span>
      </div>

      {/* Categorized Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {MENU_CATEGORIES.map((category, catIndex) => {
          // Filter items based on user roles
          const visibleItems = category.items.filter((item) => {
            if (item.adminOnly && !isAdmin) return false
            if (item.employeeOnly && !isEmployee) return false
            if (item.approverOnly && !isApprover) return false
            return true
          })

          const isSystemCategory = category.title.toUpperCase() === 'SYSTEM'
          if (visibleItems.length === 0 && !isSystemCategory) return null

          return (
            <div key={category.title}>
              {/* Category Header */}
              <div
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2',
                  catIndex === 0 ? 'mt-1' : 'mt-4',
                )}
              >
                {category.title}
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const targetTo = item.resolveTo
                    ? item.resolveTo(isAdmin, isEmployee)
                    : item.to
                  const active = isItemActive(targetTo)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.label}
                      to={targetTo}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group my-0.5',
                        active
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
                          active
                            ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 group-hover:text-slate-700 dark:group-hover:text-slate-200',
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}

                {/* Demos & Debug in SYSTEM Category */}
                {isSystemCategory && <DemoMenu isDemoActive={isDemoActive} />}
              </nav>
            </div>
          )
        })}
      </div>

      {/* Footer Sidebar (Minimalist Copyright) */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-400 shrink-0 text-center">
        &copy; {new Date().getFullYear()} PayClaim. All rights reserved.
      </div>
    </aside>
  )
}

function DemoMenu({ isDemoActive }: { isDemoActive: boolean }) {
  const [open, setOpen] = useState(isDemoActive)

  return (
    <div className="my-0.5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group cursor-pointer',
          isDemoActive
            ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
              isDemoActive
                ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 group-hover:text-slate-700 dark:group-hover:text-slate-200',
            )}
          >
            <Terminal className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <span className="truncate">Demos & Debug</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="pl-10 pr-2 py-1 space-y-1">
          <a
            href="/demo/tanstack-query"
            className="block px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 rounded-md transition-colors"
          >
            TanStack Query
          </a>
          <a
            href="/demo/store"
            className="block px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 rounded-md transition-colors"
          >
            Store
          </a>
          <a
            href="/demo/form/simple"
            className="block px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 rounded-md transition-colors"
          >
            Simple Form
          </a>
          <a
            href="/demo/form/address"
            className="block px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 rounded-md transition-colors"
          >
            Address Form
          </a>
        </div>
      )}
    </div>
  )
}
