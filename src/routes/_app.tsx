import Header from '#/components/Header'
import { Sidebar } from '#/components/Sidebar'
import { getCurrentUser } from '#/features/auth/queries/queries'
import { useOverscrollBounce } from '#/hooks/use-overscroll-bounce'

import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
} from '@tanstack/react-router'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app')({
  ssr: false,
  component: RouteComponent,

  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.fetchQuery(
        getCurrentUser(),
      )

      const isAdmin =
        user.roles?.some(
          (role: string) => role.toLowerCase() === 'admin',
        ) ?? false

      const isDirector =
        user.positionTitle?.toLowerCase() === 'director' ||
        user.positionId?.toLowerCase() === 'dir'

      return {
        user,
        isAdmin,
        isDirector,
      }
    } catch {
      toast.error('Your session has expired, please sign in again')

      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  const matches = useMatches()

  const activePath =
    matches[matches.length - 1]?.pathname ?? 'root'

  const contentRef = useRef<HTMLDivElement>(null)

  // Desktop: sidebar terbuka.
  // Mobile: sidebar tertutup.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.matchMedia('(min-width: 768px)').matches
  })

  // Menyesuaikan kondisi sidebar ketika ukuran layar berubah.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')

    const handleScreenChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches)
    }

    setIsSidebarOpen(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleScreenChange)

    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange)
    }
  }, [])

  // Efek overscroll hanya untuk area konten.
  useOverscrollBounce(contentRef)

  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SIDEBAR */}
      <Sidebar
        className="fixed left-0 top-0"
        isCollapsed={!isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* MAIN CONTENT */}
      <div
        className={`
          min-h-screen min-w-0 ms-16 pb-16
          [overflow-anchor:none]
          transition-[margin-inline-start]
          duration-300 ease-in-out
          ${isSidebarOpen ? 'md:ms-75' : 'md:ms-16'}
        `}
      >
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <div ref={contentRef}>
          <div
            key={activePath}
            className="p-7.5 page-flow-in"
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}