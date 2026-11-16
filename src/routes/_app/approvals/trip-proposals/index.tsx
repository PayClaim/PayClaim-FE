import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '#/features/auth/queries/queries'

import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import type { TripProposalFilterParams } from '#/features/trip-proposals/queries/queries'
import type { TripProposal } from '#/types/tripProposals.type'

import {
  ArrowRight,
  Calendar,
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

export const Route = createFileRoute('/_app/approvals/trip-proposals/')({
  validateSearch: (s) => s as TripProposalFilterParams,
  beforeLoad: ({ context }) => {
    const roles = context.user.roles

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

  const isFinance = roleLower.includes('finance') && !isFinanceManager

  const isManager =
    (roleLower.includes('manager') || roleLower.includes('project manager')) &&
    !isFinanceManager

  // Determine whether this proposal is waiting for the current user's action.
  const needsMyApproval =
    (!isOwnProposal || isAdmin) &&
    ((norm === 'submitted' && (isAdmin || isManager)) ||
      (norm === 'underreview' && (isAdmin || isFinance || isFinanceManager)) ||
      (norm === 'financemanagerreview' && (isAdmin || isFinanceManager)))

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
        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
          ID: TRIP-{proposal.id.slice(0, 8).toUpperCase()}
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
          <span>
            {formatDate(proposal.startDate)} – {formatDate(proposal.endDate)}
          </span>
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
  const routeQuery = Route.useSearch()
  const navigate = useNavigate()
  const { data: user } = useQuery(getCurrentUser())
  const roles = user?.roles || []
  const {
    data: proposalResponse,
    isFetching,
    isError,
    error,
  } = useGetAllProposalsQuery(routeQuery)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(routeQuery.destination)
  const [statusQuery, setStatusQuery] = useState(routeQuery.status)
  const [startFrom, setStartFrom] = useState(routeQuery.startDateFrom)
  const [startTo, setStartTo] = useState(routeQuery.startDateTo)

  const proposals = proposalResponse?.data || []

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

  const statusOptions = [
    { label: 'Submitted', optionValue: 'Submitted' },
    { label: 'Under Review', optionValue: 'UnderReview' },
    { label: 'Needs Revision', optionValue: 'NeedsRevision' },
    { label: 'Approved', optionValue: 'Approved' },
    { label: 'Rejected', optionValue: 'Rejected' },
    { label: 'Completed', optionValue: 'Completed' },
    { label: 'Cancelled', optionValue: 'Cancelled' },
    { label: 'Finance Manager Review', optionValue: 'FinanceManagerReview' },
  ]

  const hasActiveFilters = Boolean(
    searchQuery || statusQuery || startFrom || startTo,
  )

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        destination: searchQuery,
        status: statusQuery,
        startDateFrom: startFrom,
        startDateTo: startTo,
      },
    })
  }

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          An error occurs when loading employees data.
          {error instanceof Error
            ? error.message
            : 'Failed to load employees data.'}
        </div>
      </main>
    )
  }

  if (!proposalResponse || isFetching) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          Loading trip proposals...
        </p>
      </main>
    )
  }

  const { data, errors, message, statusCode, success, ...paginationProp } =
    proposalResponse

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
            <span className="tabular-nums font-medium">
              {formatCurrency(metrics.totalBudget)}
            </span>{' '}
            total budget
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
            <span className="tabular-nums font-medium">
              {formatCurrency(metrics.waitingBudget)}
            </span>{' '}
            pending review
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
            <span className="tabular-nums font-medium">
              {formatCurrency(metrics.approvedBudget)}
            </span>{' '}
            approved budget
          </p>
        </div>
      </div>

      {/* Proposal Table Container */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
        <div className="flex justify-between min-w-0 gap-4 p-5 border-b border-border">
          {' '}
          <div>
            <h2 className="font-semibold text-foreground text-base">
              Trip Proposal Requests
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a proposal to view its details and approval history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Segmented Status Tabs */}

            <div className="flex grow items-center gap-3">
              <ButtonGroup>
                <div className="relative grow max-w-70 sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plan or benefit..."
                    className="w-full pl-9 pr-4 py-2.25 bg-background border border-border rounded-lg rounded-br-none rounded-tr-none text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
                <Button onClick={applyFilterClick}>Search</Button>
              </ButtonGroup>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button>
                  <Filter /> Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="grid grid-cols-1 gap-4 w-fit"
              >
                <FilterSelect
                  val={statusQuery}
                  setValue={setStatusQuery}
                  options={statusOptions}
                  filterLabel="Status"
                  nullLabel="All Status"
                  nullable
                />

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(undefined)
                      setStatusQuery(undefined)
                      setStartFrom(undefined)
                      setStartTo(undefined)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground h-9 border"
                  >
                    Reset Filter
                  </Button>
                )}
                <Button onClick={applyFilterClick}>Apply</Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table Content */}
        {proposals.length === 0 ? (
          <div className="p-12 text-center">
            <Plane className="mx-auto text-muted-foreground/40" size={36} />
            <h3 className="mt-3 font-medium text-foreground">
              No trip proposals found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? 'No trip proposals match your filter criteria.'
                : 'There are currently no trip proposals available for review.'}
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-262.5 whitespace-nowrap text-left text-sm">
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
                {proposals.map((proposal) => (
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

            <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Showing {proposals.length} of {proposalResponse.totalCount}{' '}
                  total proposals
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
