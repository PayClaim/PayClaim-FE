import { ChevronsUpDown, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { storage } from '#/lib/storage'

export default function Header() {
  const { user } = useRouteContext({ from: '/_app' })
  const navigate = useNavigate()

  const onClickLogout = async () => {
    try {
      storage.remove('token')
      await navigate({
        to: '/login',
        search: {
          redirect: null,
        },
      })
    } catch (err) {
      console.error(err)
    }
  }

  const primaryRole = user.roles[0] || 'User'
  const initial = user.username ? user.username[0].toUpperCase() : 'U'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
          Welcome back,{' '}
          <strong className="font-semibold text-heading">
            {user.username}
          </strong>
        </span>
        <ThemeToggle />
      </div>

      <UserDropDown user={user} logout={onClickLogout}>
        <button
          type="button"
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer group bg-card"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {initial}
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {user.username}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {primaryRole}
            </div>
          </div>
          <ChevronsUpDown
            className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0"
            strokeWidth={1.75}
          />
        </button>
      </UserDropDown>
    </header>
  )
}

function UserDropDown({
  children,
  user,
  logout,
}: {
  children: ReactNode
  user: { username: string; roles?: string[] }
  logout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <div className="px-3 py-2 border-b border-border/60 mb-1">
          <p className="text-sm font-bold text-heading truncate">
            {user.username}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {user.roles?.[0] || 'User'}
          </p>
        </div>

        <DropdownMenuItem
          onClick={() => logout()}
          className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 gap-2 cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
