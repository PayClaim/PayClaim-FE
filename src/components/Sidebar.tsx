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
  ChevronDown,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { cn } from 'cn'

export interface TLink {
  to: string
  label: string
  adminOnly?: boolean
  employeeOnly?: boolean
  approverOnly?: boolean
}

interface MenuChild {
  label: string
  to: string
}

interface MenuItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  adminOnly?: boolean
  employeeOnly?: boolean
  approverOnly?: boolean
  hideForAdminOrDirector?: boolean
  resolveTo?: (isAdmin: boolean, isEmployee: boolean) => string
  resolveLabel?: (isAdmin: boolean, isEmployee: boolean) => string
  children?: MenuChild[]
}

interface MenuCategory {
  title: string
  resolveTitle?: (isAdmin: boolean, isEmployee: boolean) => string
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
        label: 'My Claims',
        to: '/claims',
        icon: Receipt,
        hideForAdminOrDirector: true,
      },
      {
        label: 'My Trip Proposals',
        to: '/trip-proposals/',
        icon: Plane,
        hideForAdminOrDirector: true,
      },
      {
        label: 'Approvals',
        to: '/approvals',
        icon: CheckCircle2,
        approverOnly: true,
        children: [
          {
            label: 'Approval Claims',
            to: '/approvals/claims',
          },
          {
            label: 'Approval Trip Proposals',
            to: '/approvals/trip-proposals',
          },
        ],
      },
    ],
  },
  {
    title: 'Benefits Management',
    resolveTitle: (isAdmin) =>
      isAdmin ? 'Benefits Management' : 'Benefits',
    items: [
      {
        label: 'Benefits',
        resolveLabel: (isAdmin) =>
          isAdmin ? 'Benefits' : 'My Benefits',
        to: '/benefits',
        icon: Gift,
        resolveTo: (isAdmin) =>
          isAdmin ? '/admin/benefits' : '/benefits',
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

// Membandingkan URL tanpa mempermasalahkan trailing slash.
function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

// Mengecek apakah URL yang sedang dibuka berada di dalam suatu route.
function matchesPath(pathname: string, targetPath: string) {
  const currentPath = normalizePath(pathname)
  const normalizedTarget = normalizePath(targetPath)

  return (
    currentPath === normalizedTarget ||
    currentPath.startsWith(`${normalizedTarget}/`)
  )
}

export function Sidebar({
  className = '',
}: {
  className?: string
}) {
  const { pathname } = useLocation()
  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles || []

  const isAdmin = roles.some(
    (role) => role.toLowerCase() === 'admin',
  )

  const isEmployee = roles.some(
    (role) => role.toLowerCase() === 'employee',
  )

  const isApprover = roles.some((role) =>
    ['admin', 'manager', 'finance', 'finance manager'].includes(
      role.toLowerCase(),
    ),
  )

  const isDirector =
    user?.positionTitle?.toLowerCase() === 'director' ||
    user?.positionId?.toLowerCase() === 'dir'
  const isRestricted = isAdmin || isDirector

  // Mengumpulkan route menu yang memang boleh dilihat oleh user.
  const visibleMenuPaths = MENU_CATEGORIES.flatMap((category) =>
    category.items.flatMap((item) => {
      if (item.adminOnly && !isAdmin) return []
      if (item.employeeOnly && !isEmployee) return []
      if (item.approverOnly && !isApprover) return []
      if (item.hideForAdminOrDirector && isRestricted) return []

      if (item.children) {
        return item.children.map((child) => child.to)
      }

      return [
        item.resolveTo
          ? item.resolveTo(isAdmin, isEmployee)
          : item.to,
      ]
    }),
  )

  // Menentukan menu biasa yang sedang aktif.
  const isItemActive = (targetPath: string) => {
    if (!matchesPath(pathname, targetPath)) {
      return false
    }

    const normalizedTarget = normalizePath(targetPath)

    // Jika ada route menu lain yang lebih spesifik, gunakan route tersebut.
    const hasMoreSpecificMatch = visibleMenuPaths.some((menuPath) => {
      const normalizedMenuPath = normalizePath(menuPath)

      if (normalizedMenuPath === normalizedTarget) {
        return false
      }

      return matchesPath(pathname, normalizedMenuPath)
    })

    return !hasMoreSpecificMatch
  }

  return (
    <aside
      className={cn(
        'w-75 h-screen bg-slate-50/80 dark:bg-sidebar border-r border-slate-200/80 dark:border-sidebar-border flex flex-col justify-between backdrop-blur-sm z-30 select-none',
        className,
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200/80 dark:border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-secondary p-1 border border-slate-200/70 dark:border-border flex items-center justify-center shadow-2xs shrink-0">
          <img
            src="/logo-mii.png"
            alt="Mitra Integrasi Informatika"
            className="w-full h-full object-contain"
          />
        </div>

        <span className="font-bold text-slate-900 dark:text-foreground text-lg tracking-tight">
          PayClaim
        </span>
      </div>

      {/* Categorized Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {MENU_CATEGORIES.map((category, catIndex) => {
          const visibleItems = category.items.filter((item) => {
            if (item.adminOnly && !isAdmin) return false
            if (item.employeeOnly && !isEmployee) return false
            if (item.approverOnly && !isApprover) return false
            if (item.hideForAdminOrDirector && isRestricted) return false

            return true
          })

          // Sembunyikan kategori jika tidak ada menu yang dapat diakses oleh role saat ini
          if (visibleItems.length === 0) {
            return null
          }

          return (
            <div key={category.title}>
              {/* Category Header */}
              <div
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground px-3 mb-2',
                  catIndex === 0 ? 'mt-1' : 'mt-4',
                )}
              >
                {category.resolveTitle
                  ? category.resolveTitle(isAdmin, isEmployee)
                  : category.title}
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  // Jika menu memiliki children, tampilkan dropdown.
                  if (item.children) {
                    return (
                      <ApprovalDropdown
                        key={item.label}
                        pathname={pathname}
                        items={item.children}
                      />
                    )
                  }

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
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group my-0.5',
                        active
                          ? 'bg-blue-50/90 dark:bg-secondary text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-muted-foreground font-medium hover:bg-slate-100/80 dark:hover:bg-secondary/70 hover:text-slate-900 dark:hover:text-foreground hover:translate-x-0.5',
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
                          active
                            ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-secondary text-slate-500 dark:text-muted-foreground group-hover:bg-slate-200/80 dark:group-hover:bg-muted group-hover:text-slate-700 dark:group-hover:text-foreground',
                        )}
                      >
                        <Icon
                          className="w-4 h-4"
                          strokeWidth={1.75}
                        />
                      </div>

                      <span className="truncate">
                        {item.resolveLabel
                          ? item.resolveLabel(isAdmin, isEmployee)
                          : item.label}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-sidebar-border text-xs text-slate-400 dark:text-muted-foreground shrink-0 text-center">
        &copy; {new Date().getFullYear()} PayClaim. All rights reserved.
      </div>
    </aside>
  )
}

// Dropdown Approvals
function ApprovalDropdown({
  pathname,
  items,
}: {
  pathname: string
  items: MenuChild[]
}) {
  const isActive = items.some((item) =>
    matchesPath(pathname, item.to),
  )

  const [open, setOpen] = useState(isActive)

  // Otomatis membuka dropdown ketika masuk halaman Approval.
  useEffect(() => {
    if (isActive) {
      setOpen(true)
    }
  }, [isActive])

  return (
    <div className="my-0.5">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group cursor-pointer',
          isActive
            ? 'bg-blue-50/90 dark:bg-secondary text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-600 dark:text-muted-foreground font-medium hover:bg-slate-100/80 dark:hover:bg-secondary/70 hover:text-slate-900 dark:hover:text-foreground',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
              isActive
                ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-secondary text-slate-500 dark:text-muted-foreground group-hover:bg-slate-200/80 dark:group-hover:bg-muted group-hover:text-slate-700 dark:group-hover:text-foreground',
            )}
          >
            <CheckCircle2
              className="w-4 h-4"
              strokeWidth={1.75}
            />
          </div>

          <span className="truncate">Approvals</span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 dark:text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="border-l-2 border-slate-200 dark:border-border ml-5 pl-3 py-1 space-y-1 mt-1">
          {items.map((item) => {
            const active = matchesPath(pathname, item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'block px-2.5 py-1.5 text-xs rounded-md transition-colors',
                  active
                    ? 'bg-blue-50/80 dark:bg-secondary text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-secondary/60',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
