import { useMemo, useRef, useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import { Button } from '#/components/ui/button'
import { ListPageSkeleton } from '#/components/ui/page-skeleton'
import { AnimatedNumber } from '#/components/ui/animated-number'
import { useSearchShortcut } from '#/hooks/use-search-shortcut'

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plane,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'

export const Route = createFileRoute('/_app/trip-proposals/')({
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function normalizeStatus(status: string) {
  return (status || '').replace(/[\s_-]/g, '').toLowerCase()
}

function getSubmittedAtTime(value?: string | null): number {
  if (!value) return 0

  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : 0
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getProposalStatusConfig(status: string) {
  const norm = normalizeStatus(status)
  switch (norm) {
    case 'submitted':
      return {
        label: 'Submitted',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'underreview':
      return {
        label: 'Under Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'financemanagerreview':
      return {
        label: 'Finance Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
        dotColor: 'bg-blue-600',
      }
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-600',
      }
    case 'needsrevision':
      return {
        label: 'Needs Revision',
        className: 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
        dotColor: 'bg-orange-500',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-500',
      }
  }
}

type ProposalTab = 'ALL' | 'WAITING' | 'APPROVED' | 'COMPLETED' | 'REVISION_OR_REJECTED'

function RouteComponent() {
  const navigate = useNavigate()
  const { data: user } = useQuery(getCurrentUser())

  const {
    data: proposals = [],
    isError,
    isFetching,
    error,
  } = useGetAllProposalsQuery(user?.employeeId)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchInputRef)
  const [activeTab, setActiveTab] = useState<ProposalTab>('ALL')

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = proposals.length
    const totalAmount = proposals.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

    const waiting = proposals.filter((p) => {
      const s = normalizeStatus(p.status)
      return ['submitted', 'underreview', 'financemanagerreview', 'pending'].includes(s)
    })
    const waitingCount = waiting.length
    const waitingAmount = waiting.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

    const approvedCompleted = proposals.filter((p) => {
      const s = normalizeStatus(p.status)
      return ['approved', 'completed'].includes(s)
    })
    const approvedCompletedCount = approvedCompleted.length
    const approvedCompletedAmount = approvedCompleted.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    )

    return {
      totalCount,
      totalAmount,
      waitingCount,
      waitingAmount,
      approvedCompletedCount,
      approvedCompletedAmount,
    }
  }, [proposals])

  // Filtered proposals based on active tab and search query
 const filteredProposals = useMemo(() => {
  const q = searchQuery.trim().toLowerCase()

  return proposals.filter((proposal) => {
    const norm = normalizeStatus(proposal.status)

    // Tab filter
    if (activeTab === 'WAITING') {
      if (
        ![
          'submitted',
          'underreview',
          'financemanagerreview',
          'pending',
        ].includes(norm)
      ) {
        return false
      }
    } else if (activeTab === 'APPROVED') {
      if (norm !== 'approved') return false
    } else if (activeTab === 'COMPLETED') {
      if (norm !== 'completed') return false
    } else if (activeTab === 'REVISION_OR_REJECTED') {
      if (!['needsrevision', 'rejected', 'cancelled'].includes(norm)) {
        return false
      }
    }

    // Search query
    if (q) {
      const dest = (proposal.destination || '').toLowerCase()
      const pic = (proposal.picName || '').toLowerCase()
      const id = (proposal.id || '').toLowerCase()

      return dest.includes(q) || pic.includes(q) || id.includes(q)
    }

    return true
  })
}, [proposals, activeTab, searchQuery])

const sortedProposals = useMemo(() => {
  const getProposalPriority = (status: string): number => {
    const normalized = normalizeStatus(status)

    if (normalized === 'needsrevision') {
      return 0
    }

    if (
      [
        'submitted',
        'underreview',
        'financemanagerreview',
        'pending',
      ].includes(normalized)
    ) {
      return 1
    }

    if (normalized === 'approved') {
      return 2
    }

    if (normalized === 'completed') {
      return 3
    }

    if (['rejected', 'cancelled'].includes(normalized)) {
      return 4
    }

    return 5
  }

  return [...filteredProposals].sort((a, b) => {
    const priorityDifference =
      getProposalPriority(a.status) -
      getProposalPriority(b.status)

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return (
      getSubmittedAtTime(b.submittedAt) -
      getSubmittedAtTime(a.submittedAt)
    )
  })
}, [filteredProposals])

  if (isError) {
    return (
      <div className="p-8 text-center space-y-3 bg-card rounded-2xl border border-border">
        <p className="font-semibold text-rose-600">Failed to load business trip proposals.</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }

  if (isFetching && proposals.length === 0) {
    return <ListPageSkeleton />
  }

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            My Trip Proposals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track your business trip proposals (as PIC or participant).
          </p>
        </div>

        <Link to="/trip-proposals/create">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-2xs h-9 px-3.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Submit New Proposal
          </Button>
        </Link>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Proposals */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Proposals
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
            <AnimatedNumber value={metrics.totalCount} duration={400} />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.totalAmount)}</span> total estimated budget
          </p>
        </div>

        {/* KPI 2: Waiting Review */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Waiting for Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
            <AnimatedNumber value={metrics.waitingCount} duration={400} />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.waitingAmount)}</span> pending review
          </p>
        </div>

        {/* KPI 3: Approved / Completed */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Approved / Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={metrics.approvedCompletedCount} duration={400} />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.approvedCompletedAmount)}</span> approved / completed
          </p>
        </div>
      </div>

      {/* Proposals Table Container */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
<div className="flex min-w-0 flex-col gap-4 p-5 border-b border-border">          <div>
            <h2 className="font-semibold text-heading text-base">
              Trip Proposal History
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a proposal row to view approval timeline, participants, and supporting documents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Segmented Status Tabs */}
            <div className="flex w-fit max-w-full min-w-0 shrink-0 flex-nowrap overflow-x-auto whitespace-nowrap rounded-lg border border-border bg-muted/40 p-1 text-xs">              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${                  activeTab === 'ALL'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('WAITING')}
className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${                  activeTab === 'WAITING'
                    ? 'bg-card text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Waiting Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPROVED')}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${                  activeTab === 'APPROVED'
                    ? 'bg-card text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'COMPLETED'
                    ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REVISION_OR_REJECTED')}
className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${                  activeTab === 'REVISION_OR_REJECTED'
                    ? 'bg-card text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Revision / Rejected
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search destination, PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-9 py-1.5 text-xs bg-muted/40 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
<table className="w-full min-w-[1100px] text-left border-collapse text-xs">            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Destinasi</th>
                <th className="py-3 px-5">Trip Period</th>
                <th className="py-3 px-5">PIC</th>
                <th className="py-3 px-5">Peserta</th>
                <th className="py-3 px-5 text-right">Total Biaya</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedProposals.map((proposal) => {
                const statusConfig = getProposalStatusConfig(proposal.status)

                const isCurrentUserPic = Boolean(
                  (proposal.picEmployeeId &&
                    user?.employeeId &&
                    proposal.picEmployeeId.toLowerCase() ===
                      user.employeeId.toLowerCase()) ||
                  (user?.fullName &&
                    proposal.picName &&
                    user.fullName.trim().toLowerCase() ===
                      proposal.picName.trim().toLowerCase()),
                )

                return (
                  <tr
                    key={proposal.id}
                    onClick={() =>
                      navigate({
                        to: '/trip-proposals/$id',
                        params: { id: proposal.id },
                      })
                    }
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    {/* Destinasi */}
                    <td className="py-3.5 px-5 min-w-[180px]">
                        <div className="max-w-[240px] truncate whitespace-nowrap font-semibold text-foreground text-sm">
                          {proposal.destination}
                        </div>
                      </td>

                    {/* Periode Perjalanan */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{formatDate(proposal.startDate)}</span>
                        <span className="text-muted-foreground">s/d</span>
                        <span>{formatDate(proposal.endDate)}</span>
                      </div>
                    </td>

                    {/* PIC */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${
                            isCurrentUserPic
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {getInitials(proposal.picName)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs ${
                              isCurrentUserPic
                                ? 'font-bold text-foreground'
                                : 'font-medium text-foreground'
                            }`}
                          >
                            {proposal.picName || '-'}
                          </span>
                          {isCurrentUserPic && (
                            <span className="inline-flex items-center rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 text-[10px] font-bold">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Peserta */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/40 border border-border">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{proposal.participantCount} Orang</span>
                      </span>
                    </td>

                    {/* Total Biaya */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="font-semibold text-sm tabular-nums tracking-tight text-foreground">
                        {formatCurrency(proposal.totalAmount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.className}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}
                        />
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-muted-foreground/40" />
                      <p className="font-medium">Tidak ada proposal perjalanan yang ditemukan</p>
                      <p className="text-xs text-muted-foreground/80">
                        {searchQuery || activeTab !== 'ALL'
                          ? 'Coba ubah kata kunci pencarian atau tab status.'
                          : 'Anda belum terdaftar dalam proposal perjalanan dinas mana pun.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
          <span>Showing {filteredProposals.length} of {proposals.length} total proposals</span>
          {activeTab !== 'ALL' && (
            <span className="font-medium text-foreground">
              Filter aktif: {activeTab}
            </span>
          )}
        </div>
      </section>
    </main>
  )
}
