import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '#/features/auth/queries/queries'

import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import type { TripProposal } from '#/types/tripProposals.type'

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Plane,
  Search,
  Users,
  X,
} from 'lucide-react'

export const Route = createFileRoute(
  '/_app/approvals/trip-proposals/',
)({
  beforeLoad: ({ context }) => {
    const roles = context.user?.roles || []

    const canView = roles.some((role) =>
      ['Admin', 'Manager', 'Finance', 'Finance Manager'].some(
        (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
      ),
    )

    if (!canView) {
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

function getDateDistanceFromToday(date: string) {
  if (!date) return -1

  const [year, month, day] = date.slice(0, 10).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return -1
  }

  const tripDate = new Date(year, month - 1, day)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.abs(tripDate.getTime() - today.getTime())
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
function getApprovalStatusConfig(
  status: string,
  roles: string[],
  isOwnProposal: boolean,
) {
  const norm = normalizeStatus(status)
  const roleLower = roles.map((role) => role.toLowerCase())

  const isAdmin = roleLower.includes('admin')
  const isFinanceManager = roleLower.includes('finance manager')

  const isFinance =
    roleLower.includes('finance') && !isFinanceManager

  const isManager =
    (roleLower.includes('manager') ||
      roleLower.includes('project manager')) &&
    !isFinanceManager

  // Determine whether this proposal is waiting for the current user's action.
  const needsMyApproval =
    (!isOwnProposal || isAdmin) &&
    (
      (norm === 'submitted' && (isAdmin || isManager)) ||
      (norm === 'underreview' &&
        (isAdmin || isFinance || isFinanceManager)) ||
      (norm === 'financemanagerreview' &&
        (isAdmin || isFinanceManager))
    )

  if (needsMyApproval) {
    return {
      label: 'Need Your Approval',
      className:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      dotColor: 'bg-amber-500',
    }
  }

  switch (norm) {
    case 'submitted':
    case 'underreview':
    case 'financemanagerreview':
      return {
        label: 'Waiting for Approval',
        className:
          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400',
      }

    case 'approved':
      return {
        label: 'Approved',
        className:
          'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
      }

    case 'completed':
      return {
        label: 'Completed',
        className:
          'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        dotColor: 'bg-slate-400',
      }

    case 'needsrevision':
      return {
        label: 'Needs Revision',
        className:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
      }

    case 'rejected':
      return {
        label: 'Rejected',
        className:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        dotColor: 'bg-rose-500',
      }

    case 'cancelled':
      return {
        label: 'Cancelled',
        className:
          'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        dotColor: 'bg-slate-400',
      }

    default:
      return {
        label: status,
        className:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-500',
      }
  }
}

type TripStatusTab = 'ALL' | 'WAITING' | 'APPROVED' | 'REVISION_OR_REJECTED'

function ProposalRow({
  proposal,
  roles,
  currentEmployeeId,
  currentFullName,
}: {
  proposal: TripProposal
  roles: string[]
  currentEmployeeId?: string
  currentFullName?: string
}) {

  const navigate = useNavigate()
const isOwnProposal = Boolean(
  (proposal.picEmployeeId &&
    currentEmployeeId &&
    proposal.picEmployeeId.toLowerCase() ===
      currentEmployeeId.toLowerCase()) ||
    (currentFullName &&
      proposal.picName &&
      currentFullName.trim().toLowerCase() ===
        proposal.picName.trim().toLowerCase()),
)

const statusConfig = getApprovalStatusConfig(
  proposal.status,
  roles,
  isOwnProposal,
)

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-muted/50 group"
      onClick={() =>
        navigate({
          to: '/approvals/trip-proposals/$id',
          params: { id: proposal.id },
        })
      }
    >
      {/* Destination & Proposal Code */}
      <td className="px-5 py-4">
        <div className="font-semibold text-foreground text-sm">
          {proposal.destination}
        </div>
      </td>

      {/* PIC with Initials Avatar */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
            {getInitials(proposal.picName)}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">
              {proposal.picName || '-'}
            </p>
          </div>
        </div>
      </td>

      {/* Trip Period Dates */}
      <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{formatDate(proposal.startDate)} – {formatDate(proposal.endDate)}</span>
        </div>
      </td>

      {/* Total Amount */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className="font-semibold text-sm tabular-nums tracking-tight text-foreground">
          {formatCurrency(proposal.totalAmount)}
        </span>
      </td>

      {/* Participants with Users Icon and Grammar Fix */}
      <td className="px-5 py-4 text-foreground text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {proposal.participantCount}{' '}
            {proposal.participantCount === 1 ? 'person' : 'people'}
          </span>
        </div>
      </td>

      {/* Status Badge with Dot */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}
          />
          {statusConfig.label}
        </span>
      </td>

      {/* Arrow Navigation */}
      <td className="px-5 py-4 text-right">
        <ArrowRight
          size={18}
          className="ml-auto text-muted-foreground/60 group-hover:text-foreground transition-colors"
        />
      </td>
    </tr>
  )
}

function RouteComponent() {
  const { data: user } = useQuery(getCurrentUser())
const roles = user?.roles || []
  const {
    data: proposals = [],
    isLoading,
    isError,
    error,
  } = useGetAllProposalsQuery()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TripStatusTab>('ALL')

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = proposals.length
    const totalBudget = proposals.reduce(
      (acc, p) => acc + (p.totalAmount || 0),
      0,
    )

    const waitingProposals = proposals.filter((p) =>
      ['submitted', 'underreview', 'financemanagerreview'].includes(
        normalizeStatus(p.status),
      ),
    )
    const waitingCount = waitingProposals.length
    const waitingBudget = waitingProposals.reduce(
      (acc, p) => acc + (p.totalAmount || 0),
      0,
    )

    const approvedProposals = proposals.filter((p) =>
      ['approved', 'completed'].includes(normalizeStatus(p.status)),
    )
    const approvedCount = approvedProposals.length
    const approvedBudget = approvedProposals.reduce(
      (acc, p) => acc + (p.totalAmount || 0),
      0,
    )

    return {
      totalCount,
      totalBudget,
      waitingCount,
      waitingBudget,
      approvedCount,
      approvedBudget,
    }
  }, [proposals])

  // Filtered proposals based on search & active tab
  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return proposals.filter((proposal) => {
      const norm = normalizeStatus(proposal.status)

      // Tab filter
      if (activeTab === 'WAITING') {
        if (!['submitted', 'underreview', 'financemanagerreview'].includes(norm))
          return false
      } else if (activeTab === 'APPROVED') {
        if (!['approved', 'completed'].includes(norm)) return false
      } else if (activeTab === 'REVISION_OR_REJECTED') {
        if (!['needsrevision', 'rejected', 'cancelled'].includes(norm))
          return false
      }

      // Search query
      if (q) {
        const destMatch = (proposal.destination || '').toLowerCase().includes(q)
        const picMatch = (proposal.picName || '').toLowerCase().includes(q)
        const idMatch = proposal.id.toLowerCase().includes(q)
        return destMatch || picMatch || idMatch
      }

      return true
    })
  }, [proposals, searchQuery, activeTab])

  const sortedProposals = useMemo(() => {
  const isOwnProposal = (proposal: TripProposal) =>
    Boolean(
      (proposal.picEmployeeId &&
        user?.employeeId &&
        proposal.picEmployeeId.toLowerCase() ===
          user.employeeId.toLowerCase()) ||
        (user?.fullName &&
          proposal.picName &&
          user.fullName.trim().toLowerCase() ===
            proposal.picName.trim().toLowerCase()),
    )

  const getProposalPriority = (proposal: TripProposal): number => {
    const normalized = normalizeStatus(proposal.status)

    // Urgent: perlu revisi.
    if (normalized === 'needsrevision') {
      return 0
    }

    // Urgent: memerlukan tindakan pengguna yang login.
    const statusConfig = getApprovalStatusConfig(
      proposal.status,
      roles,
      isOwnProposal(proposal),
    )

    if (statusConfig.label === 'Need Your Approval') {
      return 0
    }

    // Masih menunggu proses approval lainnya.
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

    if (['approved', 'completed'].includes(normalized)) {
      return 2
    }

    if (['rejected', 'cancelled'].includes(normalized)) {
      return 3
    }

    return 4
  }

  return [...filteredProposals].sort((a, b) => {
    const priorityDifference =
      getProposalPriority(a) - getProposalPriority(b)

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return (
      getSubmittedAtTime(b.submittedAt) -
      getSubmittedAtTime(a.submittedAt)
    )
  })
}, [filteredProposals, roles, user?.employeeId, user?.fullName])

  return (
    <main className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Plane size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Approval Trip Proposals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and process submitted business trip proposals.
          </p>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Proposals */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Proposals
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Plane className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-heading">
            {metrics.totalCount}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.totalBudget)}</span> total budget
          </p>
        </div>

        {/* KPI 2: Waiting for Review */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Waiting for Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.waitingCount}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.waitingBudget)}</span> pending review
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
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.approvedCount}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">{formatCurrency(metrics.approvedBudget)}</span> approved budget
          </p>
        </div>
      </div>

      {/* Proposal Table Container */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
<div className="flex min-w-0 flex-col gap-4 p-5 border-b border-border">          <div>
            <h2 className="font-semibold text-foreground text-base">
              Trip Proposal Requests
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a proposal to view its details and approval history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Segmented Status Tabs */}
<div className="flex w-fit max-w-full min-w-0 shrink-0 flex-nowrap overflow-x-auto whitespace-nowrap rounded-lg border border-border bg-muted/40 p-0.5 text-xs">              <button
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
                    ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REVISION_OR_REJECTED')}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${                  activeTab === 'REVISION_OR_REJECTED'
                    ? 'bg-card text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Needs Revision / Rejected
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination, PIC..."
                className="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading trip proposals...
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load trip proposals.'}
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-12 text-center">
            <Plane className="mx-auto text-muted-foreground/40" size={36} />
            <h3 className="mt-3 font-medium text-foreground">
              No trip proposals found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || activeTab !== 'ALL'
                ? 'No trip proposals match your filter criteria.'
                : 'There are currently no trip proposals available for review.'}
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-[1050px] whitespace-nowrap text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Destination</th>
                  <th className="px-5 py-3.5 font-medium">PIC</th>
                  <th className="px-5 py-3.5 font-medium">Trip Period</th>
                  <th className="px-5 py-3.5 font-medium">Total Amount</th>
                  <th className="px-5 py-3.5 font-medium">Participants</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
               {sortedProposals.map((proposal) => (
                  <ProposalRow
                    key={proposal.id}
                    proposal={proposal}
                    roles={roles}
                    currentEmployeeId={user?.employeeId}
                    currentFullName={user?.fullName}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
