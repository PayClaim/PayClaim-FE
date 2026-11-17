import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { DateRange } from 'react-day-picker'

import { getCurrentUser } from '#/features/auth/queries/queries'

import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import type { TripProposalFilterParams } from '#/features/trip-proposals/queries/queries'
import type { TripProposal } from '#/types/tripProposals.type'
import {
  markRecordCardSource,
  viewTransitionNavOptions,
} from '#/lib/view-transition'

import { toDateOnly } from '#/lib/utils'

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Plane,
  Search,
  Users,
} from 'lucide-react'

import { PaginationSection } from '#/components/PaginationSection'
import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterSelect } from '#/components/FilterSelect'
import { DatePickerWithRange } from '#/components/DateRangePicker'

// =====================================================
// ROUTE
// =====================================================

export const Route = createFileRoute('/_app/approvals/trip-proposals/')({
  validateSearch: (s) => s as TripProposalFilterParams,

  beforeLoad: ({ context }) => {
    const roles = context.user?.roles ?? []

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

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatDate(date?: string | null) {
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

function getInitials(name?: string | null): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getSubmittedAtTime(date?: string | null): number {
  if (!date) return 0

  const timestamp = new Date(date).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function isOwnProposal(
  proposal: TripProposal,
  currentEmployeeId?: string,
  currentFullName?: string,
): boolean {
  return Boolean(
    (proposal.picEmployeeId &&
      currentEmployeeId &&
      proposal.picEmployeeId.toLowerCase() ===
        currentEmployeeId.toLowerCase()) ||
    (currentFullName &&
      proposal.picName &&
      currentFullName.trim().toLowerCase() ===
        proposal.picName.trim().toLowerCase()),
  )
}

// =====================================================
// ROLE HELPERS
// =====================================================

function getRoleFlags(roles: string[]) {
  const roleLower = roles.map((role) => role.trim().toLowerCase())

  const isAdmin = roleLower.includes('admin')

  const isFinanceManager = roleLower.includes('finance manager')

  const isFinance = roleLower.includes('finance') && !isFinanceManager

  const isManager =
    (roleLower.includes('manager') || roleLower.includes('project manager')) &&
    !isFinanceManager

  return {
    isAdmin,
    isManager,
    isFinance,
    isFinanceManager,
  }
}

// =====================================================
// APPROVAL STATUS CONFIGURATION
// =====================================================

function getApprovalStatusConfig(
  status: string,
  roles: string[],
  isOwn: boolean,
) {
  const normalized = normalizeStatus(status)

  const { isAdmin, isManager, isFinance, isFinanceManager } =
    getRoleFlags(roles)

  const needsMyApproval =
    !isOwn &&
    ((normalized === 'submitted' && (isAdmin || isManager)) ||
      (normalized === 'underreview' &&
        (isAdmin || isFinance || isFinanceManager)) ||
      (normalized === 'financemanagerreview' && (isAdmin || isFinanceManager)))

  if (needsMyApproval) {
    return {
      label: 'Waiting for Your Approval',
      className:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      dotColor: 'bg-amber-500',
    }
  }

  switch (normalized) {
    case 'submitted':
      return {
        label: 'Waiting for Manager',
        className:
          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400',
      }

    case 'underreview':
      return {
        label: 'Waiting for Finance',
        className:
          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400',
      }

    case 'financemanagerreview':
      return {
        label: 'Waiting for Finance Manager',
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
          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
        dotColor: 'bg-orange-500',
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

// =====================================================
// PROPOSAL ROW
// =====================================================

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

  const ownProposal = isOwnProposal(
    proposal,
    currentEmployeeId,
    currentFullName,
  )

  const statusConfig = getApprovalStatusConfig(
    proposal.status,
    roles,
    ownProposal,
  )

  return (
    <tr
      className="row-enter cursor-pointer transition-colors hover:bg-muted/50 group"
      onClick={(event) => {
        markRecordCardSource(event.currentTarget)
        navigate({
          to: '/approvals/trip-proposals/$id',
          params: { id: proposal.id },
          ...viewTransitionNavOptions(),
        })
      }}
    >
      {/* Destination */}
      <td className="px-5 py-4">
        <div className="text-sm font-semibold text-foreground">
          {proposal.destination}
        </div>
      </td>

      {/* PIC */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
            {getInitials(proposal.picName)}
          </div>

          <div>
            <p className="text-sm leading-tight font-semibold text-foreground">
              {proposal.picName || '-'}
            </p>
          </div>
        </div>
      </td>

      {/* Trip Period */}
      <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          <span>
            {formatDate(proposal.startDate)} – {formatDate(proposal.endDate)}
          </span>
        </div>
      </td>

      {/* Total Amount */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className="text-sm font-semibold tracking-tight text-foreground tabular-nums">
          {formatCurrency(proposal.totalAmount)}
        </span>
      </td>

      {/* Participants */}
      <td className="px-5 py-4 text-xs text-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />

          <span>
            {proposal.participantCount}{' '}
            {proposal.participantCount === 1 ? 'person' : 'people'}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
          />

          {statusConfig.label}
        </span>
      </td>

      {/* Arrow */}
      <td className="px-5 py-4 text-right">
        <ArrowRight
          size={18}
          className="ml-auto text-muted-foreground/60 transition-colors group-hover:text-foreground"
        />
      </td>
    </tr>
  )
}

// =====================================================
// PAGE COMPONENT
// =====================================================

function RouteComponent() {
  const routeQuery = Route.useSearch()
  const navigate = useNavigate()

  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles ?? []

  const { isAdmin } = getRoleFlags(roles)

  const {
    data: proposalResponse,
    isFetching,
    isError,
    error,
  } = useGetAllProposalsQuery(routeQuery)

  // =====================================================
  // FILTER STATES
  // =====================================================

  const initialDateRange = {
    from: routeQuery.startDateFrom
      ? new Date(routeQuery.startDateFrom)
      : undefined,
    to: routeQuery.startDateTo ? new Date(routeQuery.startDateTo) : undefined,
  }

  const [searchQuery, setSearchQuery] = useState(routeQuery.destination ?? '')

  const [statusQuery, setStatusQuery] = useState(routeQuery.status)

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  )

  const proposals = proposalResponse?.data ?? []

  const currentEmployeeId = user?.employeeId
  const currentFullName = user?.fullName

  // =====================================================
  // SORT PROPOSALS
  // =====================================================

  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const aOwnProposal = isOwnProposal(a, currentEmployeeId, currentFullName)

      const bOwnProposal = isOwnProposal(b, currentEmployeeId, currentFullName)

      const aWaiting =
        getApprovalStatusConfig(a.status, roles, aOwnProposal).label ===
        'Waiting for Your Approval'

      const bWaiting =
        getApprovalStatusConfig(b.status, roles, bOwnProposal).label ===
        'Waiting for Your Approval'

      // Waiting for Your Approval comes first.
      if (aWaiting !== bWaiting) {
        return aWaiting ? -1 : 1
      }

      // Sort by SubmittedAt, newest first.
      return (
        getSubmittedAtTime(b.submittedAt) - getSubmittedAtTime(a.submittedAt)
      )
    })
  }, [proposals, roles, currentEmployeeId, currentFullName])

  // =====================================================
  // KPI CALCULATIONS
  // =====================================================

  const metrics = useMemo(() => {
    const totalCount = proposalResponse?.totalCount ?? proposals.length

    const totalBudget = proposals.reduce(
      (total, proposal) => total + (proposal.totalAmount || 0),
      0,
    )

    const waitingProposals = proposals.filter((proposal) => {
      const ownProposal = isOwnProposal(
        proposal,
        currentEmployeeId,
        currentFullName,
      )

      return (
        getApprovalStatusConfig(proposal.status, roles, ownProposal).label ===
        'Waiting for Your Approval'
      )
    })

    const waitingCount = waitingProposals.length

    const waitingBudget = waitingProposals.reduce(
      (total, proposal) => total + (proposal.totalAmount || 0),
      0,
    )

    const approvedProposals = proposals.filter((proposal) =>
      ['approved', 'completed'].includes(normalizeStatus(proposal.status)),
    )

    const approvedCount = approvedProposals.length

    const approvedBudget = approvedProposals.reduce(
      (total, proposal) => total + (proposal.totalAmount || 0),
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
  }, [
    proposalResponse?.totalCount,
    proposals,
    currentEmployeeId,
    currentFullName,
    roles,
  ])

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const statusOptions = [
    { label: 'Submitted', optionValue: 'Submitted' },
    { label: 'Under Review', optionValue: 'UnderReview' },
    { label: 'Needs Revision', optionValue: 'NeedsRevision' },
    { label: 'Approved', optionValue: 'Approved' },
    { label: 'Rejected', optionValue: 'Rejected' },
    { label: 'Completed', optionValue: 'Completed' },
    { label: 'Cancelled', optionValue: 'Cancelled' },
    {
      label: 'Finance Manager Review',
      optionValue: 'FinanceManagerReview',
    },
  ]

  const hasActiveFilters = Boolean(
    searchQuery || statusQuery || dateRange?.from || dateRange?.to,
  )

  // =====================================================
  // APPLY FILTER
  // =====================================================

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        destination: searchQuery.trim() || undefined,
        status: statusQuery,
        startDateFrom: toDateOnly(dateRange?.from),
        startDateTo: toDateOnly(dateRange?.to),
      },
    })
  }

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilters = () => {
    setSearchQuery('')
    setStatusQuery(undefined)
    setDateRange(undefined)

    navigate({
      to: '.',
      search: {
        destination: undefined,
        status: undefined,
        startDateFrom: undefined,
        startDateTo: undefined,
      },
    })
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error instanceof Error
            ? error.message
            : 'Failed to load trip proposals.'}
        </div>
      </main>
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (isFetching || !proposalResponse) {
    return (
      <main className="space-y-3 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />

        <p className="text-sm text-muted-foreground">
          Loading trip proposals...
        </p>
      </main>
    )
  }

  // =====================================================
  // PAGINATION PROPS
  // =====================================================

  const {
    data: _data,
    errors: _errors,
    message: _message,
    statusCode: _statusCode,
    success: _success,
    ...paginationProp
  } = proposalResponse

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-w-0 space-y-6">
      {/* HEADER */}
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

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL PROPOSALS */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Proposals
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
            {metrics.totalCount}
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">
              {formatCurrency(metrics.totalBudget)}
            </span>{' '}
            total budget
          </p>
        </div>

        {/* WAITING FOR APPROVAL */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAdmin ? 'Waiting for Approval' : 'Waiting for Your Approval'}
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.waitingCount}
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">
              {formatCurrency(metrics.waitingBudget)}
            </span>{' '}
            value awaiting your decision
          </p>
        </div>

        {/* APPROVED / COMPLETED */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Approved / Completed
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.approvedCount}
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">
              {formatCurrency(metrics.approvedBudget)}
            </span>{' '}
            approved budget
          </p>
        </div>
      </div>

      {/* PROPOSAL TABLE */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* TABLE HEADER */}
        <div className="flex min-w-0 flex-col gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Trip Proposal Requests
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a proposal to view its details and approval history.
            </p>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            <div className="flex grow items-center gap-3">
              <ButtonGroup>
                <div className="relative max-w-70 grow sm:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        applyFilterClick()
                      }
                    }}
                    placeholder="Search destination..."
                    className="w-full rounded-lg rounded-br-none rounded-tr-none border border-border bg-background py-2.25 pr-4 pl-9 text-sm text-heading placeholder:text-muted-foreground focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 focus:outline-hidden"
                  />
                </div>

                <Button onClick={applyFilterClick}>Search</Button>
              </ButtonGroup>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button>
                  <Filter />
                  Filter
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="grid w-fit grid-cols-1 gap-4"
              >
                <FilterSelect
                  val={statusQuery}
                  setValue={setStatusQuery}
                  options={statusOptions}
                  filterLabel="Status"
                  nullLabel="All Status"
                  nullable
                />

                <DatePickerWithRange
                  placeholder="Trip start date"
                  date={dateRange}
                  setDate={setDateRange}
                />

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-9 border text-xs text-muted-foreground hover:text-foreground"
                  >
                    Reset Filter
                  </Button>
                )}

                <Button onClick={applyFilterClick}>Apply</Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {proposals.length === 0 ? (
          <div className="p-12 text-center">
            <Plane className="mx-auto text-muted-foreground/40" size={36} />

            <h3 className="mt-3 font-medium text-foreground">
              No trip proposals found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusQuery || dateRange?.from || dateRange?.to
                ? 'No trip proposals match your filter criteria.'
                : 'There are currently no trip proposals available for review.'}
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-262.5 whitespace-nowrap text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
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
                    currentEmployeeId={currentEmployeeId}
                    currentFullName={currentFullName}
                  />
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Showing {proposals.length} of{' '}
                  {proposalResponse.totalCount ?? proposals.length} total
                  proposals
                </span>
              </div>

              <div className="w-fit grow-0">
                <PaginationSection pagination={paginationProp} />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
