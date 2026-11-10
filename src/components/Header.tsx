import { ChevronDown } from 'lucide-react'
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

  return (
    <header className="sticky top-0 z-50 border-b flex p-4 justify-between items-center border-[var(--line)]px-4 bg-card">
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-2">
        Hello
        <ThemeToggle />
      </nav>
      <UserDropDown logout={onClickLogout}>
        <div className="flex justify-center items-center gap-2 pr-4 bg-background rounded-4xl p-1 h-fit cursor-pointer">
          <div className="bg-amber-300 rounded-full size-10 flex items-center justify-center">
            {user.username[0]}
          </div>
          <div className="grow mr-4">
            <div className="text-sm font-bold">{user.username}</div>
            <div className="text-xs">{user.roles[0]}</div>
          </div>
          <div>
            <ChevronDown size={20} />
          </div>
        </div>
      </UserDropDown>
    </header>
  )
}

function UserDropDown({
  children,
  logout,
}: {
  children: ReactNode
  logout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
