import { ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '#/hooks/auth.hook'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b flex p-4 justify-between items-center border-[var(--line)]px-4 bg-card">
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-2">
        Hello
        <ThemeToggle />
      </nav>
      <div className="flex justify-center items-center gap-2 pr-4 bg-background rounded-4xl p-1 h-fit">
        <div className="bg-amber-300 rounded-full size-10 flex items-center justify-center">
          A
        </div>
        <div className="grow mr-4">
          <div className="text-sm font-bold">Username</div>
          <div className="text-xs">Role</div>
        </div>
        <div>
          <ChevronDown size={20} />
        </div>
      </div>
    </header>
  )
}
