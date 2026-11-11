import { ChevronsUpDown, KeyRound, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import { storage } from '#/lib/storage'
import type { UserProfile } from '#/types/auth.type'

export default function Header() {
  const { user } = useRouteContext({ from: '/_app' }) as { user: UserProfile }
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

  const primaryRole = user.roles?.[0] || 'User'
  const displayName = user.fullName || user.username
  const department = user.departmentName
  const position = user.positionTitle
  const initial = displayName ? displayName[0].toUpperCase() : 'U'

  const greetingTitle = `Welcome back, ${[displayName, department, position]
    .filter(Boolean)
    .join(' ')}!`

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card/90 dark:bg-[#0f0f0f]/90 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0 mr-4">
        <span
          className="text-sm text-slate-500 dark:text-muted-foreground hidden sm:inline truncate"
          title={greetingTitle}
        >
          Welcome back,{' '}
          <strong className="font-semibold text-heading">
            {displayName}
          </strong>
          {department ? ` ${department}` : ''}
          {position ? ` ${position}` : ''}!
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />

        <UserDropDown user={user} logout={onClickLogout}>
          <button
            type="button"
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100/80 dark:hover:bg-secondary border border-border transition-colors cursor-pointer group bg-card"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {initial}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 dark:text-foreground max-w-[150px] truncate">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 dark:text-muted-foreground capitalize max-w-[150px] truncate">
                {position || primaryRole}
              </div>
            </div>
            <ChevronsUpDown
              className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-foreground transition-colors shrink-0"
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
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <div className="px-3 py-2 border-b border-border/60 mb-1">
          <p className="text-sm font-bold text-heading truncate">
            {displayName}
          </p>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 capitalize">
              {primaryRole}
            </span>
            {user.positionTitle && (
              <span className="text-[11px] text-muted-foreground truncate">
                {user.positionTitle}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link
            to="/change-password"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            <span>Ganti Kata Sandi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 gap-2 cursor-pointer font-medium text-xs px-3 py-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          <span>Keluar (Logout)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
