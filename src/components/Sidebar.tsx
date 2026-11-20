
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { cn } from 'cn'

// =====================================================
// TYPES
// =====================================================

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
  icon: ComponentType<{
    className?: string
    strokeWidth?: number
  }>
  adminOnly?: boolean
  employeeOnly?: boolean
  approverOnly?: boolean
  hideForAdminOrDirector?: boolean
  resolveTo?: (
    isAdmin: boolean,
    isEmployee: boolean,
  ) => string
  resolveLabel?: (
    isAdmin: boolean,
    isEmployee: boolean,
  ) => string
  children?: MenuChild[]
}

interface MenuCategory {
  title: string
  resolveTitle?: (
    isAdmin: boolean,
    isEmployee: boolean,
  ) => string
  items: MenuItem[]
}

// =====================================================
// MENU CONFIGURATION
// =====================================================

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

// =====================================================
// ROUTE HELPERS
// =====================================================

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

function matchesPath(pathname: string, targetPath: string) {
  const currentPath = normalizePath(pathname)
  const normalizedTarget = normalizePath(targetPath)

  return (
    currentPath === normalizedTarget ||
    currentPath.startsWith(`${normalizedTarget}/`)
  )
}

// =====================================================
// SIDEBAR
// =====================================================

export function Sidebar({
  className = '',
  isCollapsed = false,
  onToggle,
}: {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
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

  // Mengumpulkan route menu yang boleh dilihat user.
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

  // Menentukan menu yang sedang aktif.
  const isItemActive = (targetPath: string) => {
    if (!matchesPath(pathname, targetPath)) {
      return false
    }

    const normalizedTarget = normalizePath(targetPath)

    const hasMoreSpecificMatch = visibleMenuPaths.some(
      (menuPath) => {
        const normalizedMenuPath = normalizePath(menuPath)

        if (normalizedMenuPath === normalizedTarget) {
          return false
        }

        return matchesPath(pathname, normalizedMenuPath)
      },
    )

    return !hasMoreSpecificMatch
  }

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      {!isCollapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => onToggle?.()}
          className="
            fixed inset-0 z-40
            bg-slate-950/30
            backdrop-blur-[1px]
            md:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR CONTAINER
      ===================================================== */}

      <aside
        className={cn(
          `
            fixed left-0 top-0 z-50
            flex h-screen flex-col
            overflow-hidden
            border-r border-slate-200/80
            bg-slate-50/95
            backdrop-blur-sm
            dark:border-sidebar-border dark:bg-sidebar
            select-none
            shrink-0
            transition-[width]
            duration-300 ease-in-out
          `,
          isCollapsed ? 'w-16' : 'w-75',
          className,
        )}
      >
        {/* =====================================================
            BRAND HEADER
        ===================================================== */}

        {isCollapsed ? (
          // COLLAPSED HEADER
          <div
            className="
              flex shrink-0 flex-col items-center
              border-b border-slate-200/80
              dark:border-sidebar-border
            "
          >
            {/* LOGO */}
            <div className="flex h-16 w-full items-center justify-center">
              <div
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-200/70
                  bg-white p-1 shadow-2xs
                  dark:border-border dark:bg-secondary
                "
              >
                <img
                  src="/logo-mii.png"
                  alt="Mitra Integrasi Informatika"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* OPEN SIDEBAR BUTTON */}
            <button
              type="button"
              onClick={() => onToggle?.()}
              aria-label="Open sidebar"
              title="Open sidebar"
              className="
                mb-3 flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                text-slate-500
                transition-colors
                hover:bg-slate-200/80
                hover:text-slate-900
                dark:text-muted-foreground
                dark:hover:bg-secondary
                dark:hover:text-foreground
              "
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // EXPANDED HEADER
          <div
            className="
              flex h-16 shrink-0 items-center
              gap-3 px-5
              border-b border-slate-200/80
              dark:border-sidebar-border
            "
          >
            {/* LOGO */}
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg
                border border-slate-200/70
                bg-white p-1 shadow-2xs
                dark:border-border dark:bg-secondary
              "
            >
              <img
                src="/logo-mii.png"
                alt="Mitra Integrasi Informatika"
                className="h-full w-full object-contain"
              />
            </div>

            {/* BRAND NAME */}
            <span
              className="
                whitespace-nowrap
                text-lg font-bold tracking-tight
                text-slate-900 dark:text-foreground
              "
            >
              CAKRA
            </span>

            {/* CLOSE SIDEBAR BUTTON */}
            <button
              type="button"
              onClick={() => onToggle?.()}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="
                ml-auto flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-lg text-slate-500
                transition-colors
                hover:bg-slate-200/80
                hover:text-slate-900
                dark:text-muted-foreground
                dark:hover:bg-secondary
                dark:hover:text-foreground
              "
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* =====================================================
            CATEGORIZED NAVIGATION MENU
        ===================================================== */}

        <div
          className={cn(
            'min-h-0 w-full flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin',
            isCollapsed ? 'px-1' : 'px-4',
          )}
        >
          {MENU_CATEGORIES.map((category, catIndex) => {
            const visibleItems = category.items.filter((item) => {
              if (item.adminOnly && !isAdmin) return false
              if (item.employeeOnly && !isEmployee) return false
              if (item.approverOnly && !isApprover) return false

              if (item.hideForAdminOrDirector && isRestricted) {
                return false
              }

              return true
            })

            // Sembunyikan kategori jika tidak ada menu yang tersedia.
            if (visibleItems.length === 0) {
              return null
            }

            return (
              <div
                key={category.title}
                className="w-full min-w-0"
              >
                {/* CATEGORY HEADER */}
                {!isCollapsed && (
                  <div
                    className={cn(
                      `
                        mb-2 px-3
                        whitespace-nowrap
                        text-[11px] font-semibold uppercase
                        tracking-wider
                        text-slate-400
                        dark:text-muted-foreground
                      `,
                      catIndex === 0 ? 'mt-1' : 'mt-4',
                    )}
                  >
                    {category.resolveTitle
                      ? category.resolveTitle(isAdmin, isEmployee)
                      : category.title}
                  </div>
                )}

                {/* MENU ITEMS */}
                <nav className="w-full min-w-0 space-y-1">
                  {visibleItems.map((item) => {
                    // APPROVAL DROPDOWN
                    if (item.children) {
                      return (
                        <ApprovalDropdown
                          key={item.label}
                          pathname={pathname}
                          items={item.children}
                          isCollapsed={isCollapsed}
                          onToggleSidebar={onToggle}
                        />
                      )
                    }

                    const targetTo = item.resolveTo
                      ? item.resolveTo(isAdmin, isEmployee)
                      : item.to

                    const active = isItemActive(targetTo)
                    const Icon = item.icon

                    const itemLabel = item.resolveLabel
                      ? item.resolveLabel(isAdmin, isEmployee)
                      : item.label

                    return (
                      <Link
                        key={item.label}
                        to={targetTo}
                        title={isCollapsed ? itemLabel : undefined}
                        aria-label={itemLabel}
                        className={cn(
                          // PENTING: class flex harus tanpa tanda petik tambahan.
                          'group my-0.5 flex w-full min-w-0 flex-nowrap items-center rounded-lg text-sm transition-all duration-200',

                          isCollapsed
                            ? 'justify-center px-0 py-2'
                            : 'gap-3 px-3 py-2',

                          active
                            ? `
                              bg-blue-50/90
                              text-blue-600
                              font-semibold
                              shadow-2xs
                              dark:bg-secondary
                              dark:text-blue-400
                            `
                            : `
                              text-slate-600
                              font-medium
                              hover:bg-slate-100/80
                              hover:text-slate-900
                              dark:text-muted-foreground
                              dark:hover:bg-secondary/70
                              dark:hover:text-foreground
                            `,
                        )}
                      >
                        {/* MENU ICON */}
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
                            active
                              ? `
                                bg-blue-100/80
                                text-blue-600
                                dark:bg-blue-950/60
                                dark:text-blue-400
                              `
                              : `
                                bg-slate-100
                                text-slate-500
                                group-hover:bg-slate-200/80
                                group-hover:text-slate-700
                                dark:bg-secondary
                                dark:text-muted-foreground
                                dark:group-hover:bg-muted
                                dark:group-hover:text-foreground
                              `,
                          )}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0"
                            strokeWidth={1.75}
                          />
                        </div>

                        {/* MENU LABEL */}
                        {!isCollapsed && (
                          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                            {itemLabel}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )
          })}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {!isCollapsed && (
          <div
            className="
              shrink-0
              border-t border-slate-200/80
              p-4
              text-center text-xs
              text-slate-400
              dark:border-sidebar-border
              dark:text-muted-foreground
            "
          >
            &copy; {new Date().getFullYear()} CAKRA.
            All rights reserved.
          </div>
        )}
      </aside>
    </>
  )
}

// =====================================================
// APPROVAL DROPDOWN
// =====================================================

function ApprovalDropdown({
  pathname,
  items,
  isCollapsed,
  onToggleSidebar,
}: {
  pathname: string
  items: MenuChild[]
  isCollapsed: boolean
  onToggleSidebar?: () => void
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
    <div className="my-0.5 w-full min-w-0">
      <button
        type="button"
        onClick={() => {
          if (isCollapsed) {
            setOpen(true)
            onToggleSidebar?.()
            return
          }

          setOpen((previous) => !previous)
        }}
        aria-label="Approvals"
        title={isCollapsed ? 'Approvals' : undefined}
        aria-expanded={open}
        className={cn(
          `
            flex w-full min-w-0 items-center
            rounded-lg text-sm
            transition-all group cursor-pointer
          `,
          isCollapsed
            ? 'justify-center px-0 py-2'
            : 'justify-between px-3 py-2',
          isActive
            ? `
              bg-blue-50/90
              text-blue-600 font-semibold
              dark:bg-secondary dark:text-blue-400
            `
            : `
              text-slate-600 font-medium
              hover:bg-slate-100/80
              hover:text-slate-900
              dark:text-muted-foreground
              dark:hover:bg-secondary/70
              dark:hover:text-foreground
            `,
        )}
      >
        <div
          className={cn(
            'flex min-w-0 items-center',
            isCollapsed
              ? 'justify-center'
              : 'flex-1 gap-3',
          )}
        >
          <div
            className={cn(
              `
                flex h-7 w-7 shrink-0
                items-center justify-center
                rounded-md transition-colors
              `,
              isActive
                ? `
                  bg-blue-100/80
                  text-blue-600
                  dark:bg-blue-950/60
                  dark:text-blue-400
                `
                : `
                  bg-slate-100
                  text-slate-500
                  group-hover:bg-slate-200/80
                  group-hover:text-slate-700
                  dark:bg-secondary
                  dark:text-muted-foreground
                  dark:group-hover:bg-muted
                  dark:group-hover:text-foreground
                `,
            )}
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0"
              strokeWidth={1.75}
            />
          </div>

          {!isCollapsed && (
            <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left">
              Approvals
            </span>
          )}
        </div>

        {!isCollapsed && (
          <ChevronDown
            className={cn(
              `
                h-4 w-4 shrink-0
                text-slate-400
                transition-transform duration-200
                dark:text-muted-foreground
              `,
              open && 'rotate-180',
            )}
            strokeWidth={1.75}
          />
        )}
      </button>

      {/* APPROVAL SUBMENU */}
      {open && !isCollapsed && (
        <div
          className="
            mt-1 ml-5
            space-y-1
            border-l-2 border-slate-200
            py-1 pl-3
            dark:border-border
          "
        >
          {items.map((item) => {
            const active = matchesPath(pathname, item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  `
                    block
                    whitespace-nowrap
                    rounded-md
                    px-2.5 py-1.5
                    text-xs
                    transition-colors
                  `,
                  active
                    ? `
                      bg-blue-50/80
                      text-blue-600 font-semibold
                      dark:bg-secondary
                      dark:text-blue-400
                    `
                    : `
                      text-slate-500
                      hover:bg-blue-50/50
                      hover:text-blue-600
                      dark:text-muted-foreground
                      dark:hover:bg-secondary/60
                      dark:hover:text-blue-400
                    `,
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
