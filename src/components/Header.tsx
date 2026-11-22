
import { ChevronsUpDown, KeyRound, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useRouteContext } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import Breadcrumb from './breadcrumb'
import ThemeToggle from './ThemeToggle'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { storage } from '#/lib/storage'
import type { UserProfile } from '#/types/auth.type'

export default function Header() {
  const { user } = useRouteContext({ from: '/_app' }) as {
    user: UserProfile
  }

  const queryClient = useQueryClient()

  const onClickLogout = () => {
    try {
      storage.remove('token')
      queryClient.clear()
      window.location.href = '/login'
    } catch (err) {
      console.error(err)
    }
  }

  const primaryRole = user.roles?.[0] || 'User'
  const displayName = user.fullName || user.username
  const department = user.departmentName || user.departmentId
  const position = user.positionTitle
  const subtitle =
    department && position
      ? `${department} - ${position}`
      : department || position || primaryRole
  const initial = displayName ? displayName[0].toUpperCase() : 'U'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/10 bg-card/10 px-6 backdrop-blur-md dark:bg-[#0f0f0f]/10">
      {/* BREADCRUMB */}
      <div className="mr-4 flex min-w-0 flex-1 items-center">
        <Breadcrumb />
      </div>

      {/* HEADER ACTIONS */}
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />

        <UserDropDown user={user} logout={onClickLogout}>
          <button
            type="button"
            className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card p-1.5 pr-3 transition-all duration-150 hover:bg-slate-100/80 active:scale-[0.97] dark:hover:bg-secondary"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
              {initial}
            </div>

            <div className="hidden min-w-[160px] max-w-[280px] text-left leading-tight sm:block">
              <div className="truncate whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-foreground">
                {displayName}
              </div>

              <div className="truncate whitespace-nowrap text-xs capitalize text-slate-500 dark:text-muted-foreground">
                {subtitle}
              </div>
            </div>

            <ChevronsUpDown
              className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-foreground"
              strokeWidth={1.75}
            />
          </button>
        </UserDropDown>
      </div>
    </header>
  )
}

function UserDropDown({
  children,
  user,
  logout,
}: {
  children: ReactNode
  user: UserProfile
  logout: () => void
}) {
  const displayName = user.fullName || user.username
  const primaryRole = user.roles?.[0] || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <div className="mb-1 border-b border-border/60 px-3 py-2">
          <p className="truncate text-sm font-bold text-heading">
            {displayName}
          </p>

          {user.email && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
              {primaryRole}
            </span>

            {user.positionTitle && (
              <span className="truncate text-[11px] text-muted-foreground">
                {user.positionTitle}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link
            to="/change-password"
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <KeyRound
              className="h-4 w-4 text-slate-400"
              strokeWidth={1.75}
            />
            <span>Change Password</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer gap-2 px-3 py-2 text-xs font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:text-rose-400 dark:focus:bg-rose-950/40"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
