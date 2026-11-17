import { useMemo, useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import type { TripProposalFilterParams } from '#/features/trip-proposals/queries/queries'
import { Button } from '#/components/ui/button'
import { ListPageSkeleton } from '#/components/ui/page-skeleton'
import { SkeletonSwap } from '#/components/ui/skeleton-swap'
import { AnimatedNumber } from '#/components/ui/animated-number'
import {
  markRecordCardSource,
  viewTransitionNavOptions,
} from '#/lib/view-transition'

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Filter,
  Plane,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { ButtonGroup } from '#/components/ui/button-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterSelect } from '#/components/FilterSelect'
import { DatePickerWithRange } from '#/components/DateRangePicker'
import { PaginationSection } from '#/components/PaginationSection'
import { toDateOnly } from '#/lib/utils'

export const Route = createFileRoute('/_app/trip-proposals/')({
  validateSearch: (s) => s as TripProposalFilterParams,
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
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'underreview':
      return {
        label: 'Under Review',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'financemanagerreview':
      return {
        label: 'Finance Review',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'approved':
      return {
        label: 'Approved',
        className:
          'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
        dotColor: 'bg-blue-600',
      }
    case 'completed':
      return {
        label: 'Completed',
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-600',
      }
    case 'needsrevision':
      return {
        label: 'Needs Revision',
        className:
          'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
        dotColor: 'bg-orange-500',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className:
          'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        className:
          'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
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

function RouteComponent() {
  const routeQuery = Route.useSearch()
  const navigate = useNavigate()
  const { data: user } = useQuery(getCurrentUser())

  const {
    data: proposalResponse,
    isError,
    isPending,
    error,
  } = useGetAllProposalsQuery(routeQuery, user?.employeeId)

  const initialDateRange = {
    from: routeQuery.startDateFrom
      ? new Date(routeQuery.startDateFrom)
      : undefined,
    to: routeQuery.startDateTo ? new Date(routeQuery.startDateTo) : undefined,
  }

  const proposals = proposalResponse?.data || []

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(routeQuery.destination ?? '')

  const [statusQuery, setStatusQuery] = useState(routeQuery.status)

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  )

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = proposals.length
    const totalAmount = proposals.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    )

    const waiting = proposals.filter((p) => {
      const s = normalizeStatus(p.status)
      return [
        'submitted',
        'underreview',
        'financemanagerreview',
        'pending',
      ].includes(s)
    })
    const waitingCount = waiting.length
    const waitingAmount = waiting.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    )

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
    routeQuery.search || statusQuery || dateRange?.from || dateRange?.to,
  )

  // =====================================================
  // APPLY FILTER
  // =====================================================

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        search: searchQuery.trim() || undefined,
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
        search: undefined,
        status: undefined,
        startDateFrom: undefined,
        startDateTo: undefined,
      },
    })
  }

  if (isError) {
    return (
      <div className="p-8 text-center space-y-3 bg-card rounded-2xl border border-border">
        <p className="font-semibold text-rose-600">
          Failed to load business trip proposals.
        </p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (isPending || !proposalResponse) {
    return (
      <SkeletonSwap loading skeleton={<ListPageSkeleton />}>
        {null}
      </SkeletonSwap>
    )
  }

  const {
    data: _data,
    errors: _errors,
    message: _message,
    statusCode: _statusCode,
    success: _success,
    ...paginationProp
  } = proposalResponse

  return (
    <SkeletonSwap loading={false} skeleton={<ListPageSkeleton />}>
      <main className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              My Trip Proposals
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track your business trip proposals (as PIC or
              participant).
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
              <span className="tabular-nums font-medium">
                {formatCurrency(metrics.totalAmount)}
              </span>{' '}
              total estimated budget
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
              <span className="tabular-nums font-medium">
                {formatCurrency(metrics.waitingAmount)}
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
            <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber
                value={metrics.approvedCompletedCount}
                duration={400}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums font-medium">
                {formatCurrency(metrics.approvedCompletedAmount)}
              </span>{' '}
              approved / completed
            </p>
          </div>
        </div>

        {/* Proposals Table Container */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
          {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
          <div className="flex min-w-0 justify-between gap-4 p-5 border-b border-border">
            {' '}
            <div>
              <h2 className="font-semibold text-heading text-base">
                Trip Proposal History
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select a proposal row to view approval timeline, participants,
                and supporting documents.
              </p>
            </div>
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
                  <Button className="relative">
                    <Filter />
                    Filter
                    {hasActiveFilters && (
                      <Circle
                        fill="#ff0000"
                        color="#00000000"
                        className="absolute -right-1 -top-1"
                      />
                    )}
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
                    className="w-full"
                    placeholder="Trip start date range"
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

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-275 text-left border-collapse text-xs">
              {' '}
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Destination</th>
                  <th className="py-3 px-5">Trip Period</th>
                  <th className="py-3 px-5">PIC</th>
                  <th className="py-3 px-5">Participants</th>
                  <th className="py-3 px-5 text-right">Total Cost</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposals.map((proposal) => {
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
                      onClick={(event) => {
                        markRecordCardSource(event.currentTarget)
                        navigate({
                          to: '/trip-proposals/$id',
                          params: { id: proposal.id },
                          ...viewTransitionNavOptions(),
                        })
                      }}
                      className="row-enter hover:bg-muted/40 transition-colors cursor-pointer group"
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
                          <span className="text-muted-foreground">–</span>
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
                          <span>
                            {proposal.participantCount}{' '}
                            {proposal.participantCount === 1
                              ? 'Person'
                              : 'People'}
                          </span>
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

                {proposals.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-medium">No trip proposals found</p>
                        <p className="text-xs text-muted-foreground/80">
                          {searchQuery
                            ? 'Try changing your search keywords or status tab.'
                            : 'You are not registered in any business trip proposals yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info bar */}
          <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Showing {proposals.length} of {proposals.length} total proposals
              </span>
            </div>

            <div className="w-fit grow-0">
              <PaginationSection pagination={paginationProp} />
            </div>
          </div>
        </section>
      </main>
    </SkeletonSwap>
  )
}
