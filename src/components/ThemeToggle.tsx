import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark'

function getInitialIsDark(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean) {
  const mode: ThemeMode = isDark ? 'dark' : 'light'
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(mode)
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    const initialDark = getInitialIsDark()
    setIsDark(initialDark)
    applyTheme(initialDark)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem('theme')
      if (!stored) {
        setIsDark(e.matches)
        applyTheme(e.matches)
      }
    }

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  function toggleTheme() {
    const nextDark = !isDark
    setIsDark(nextDark)
    applyTheme(nextDark)
    window.localStorage.setItem('theme', nextDark ? 'dark' : 'light')
  }

  const label = isDark
    ? 'Switch to Day theme (Light)'
    : 'Switch to Night theme (Dark)'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-border bg-card hover:bg-slate-100/80 dark:hover:bg-secondary text-slate-600 dark:text-foreground transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
    >
      <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">{label}</span>
    </button>
  )
}
