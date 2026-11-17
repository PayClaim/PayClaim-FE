import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useGetAllClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimFilterParams } from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { ListPageSkeleton } from '#/components/ui/page-skeleton'
import { SkeletonSwap } from '#/components/ui/skeleton-swap'
import { AnimatedNumber } from '#/components/ui/animated-number'
import { Button } from '#/components/ui/button'
import {
  markRecordCardSource,
  viewTransitionNavOptions,
} from '#/lib/view-transition'

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
} from 'lucide-react'
import { PaginationSection } from '#/components/PaginationSection'
import {
  formatDate,
  getClaimTypeBadge,
  getStatusBadgeConfig,
} from '#/features/claims/utils/claim-badges'
import { ButtonGroup } from '#/components/ui/button-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterSelect } from '#/components/FilterSelect'
import { DatePickerWithRange } from '#/components/DateRangePicker'
import type { DateRange } from 'react-day-picker'
import { toDateOnly } from '#/lib/utils'
import NotFoundPage from '#/components/pages/NotFoundPage'

export const Route = createFileRoute('/_app/claims/')({
  validateSearch: (s) => s as ClaimFilterParams,
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const {
    data: claimResponse,
    isError,
    error,
    isPending,
  } = useGetAllClaimsQuery(search)

  const claims = claimResponse?.data ?? []
  const initialDateRange = {
    from: search.startDate ? new Date(search.startDate) : undefined,
    to: search.endDate ? new Date(search.endDate) : undefined,
  }

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(search.search)
  const [statusQuery, setStatusQuery] = useState(search.status)
  const [typeQuery, setTypeQuery] = useState(search.claimType)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  )

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = claimResponse?.totalCount ?? claims.length
    const totalAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0)

    const waitingClaims = claims.filter((c) =>
      ['Submitted', 'UnderReview'].includes(c.status),
    )
    const waitingCount = waitingClaims.length
    const waitingAmount = waitingClaims.reduce(
      (sum, c) => sum + (c.amount || 0),
      0,
    )

    const approvedPaidClaims = claims.filter((c) =>
      ['Approved', 'Paid'].includes(c.status),
    )
    const approvedPaidCount = approvedPaidClaims.length
    const approvedPaidAmount = approvedPaidClaims.reduce(
      (sum, c) => sum + (c.amount || 0),
      0,
    )

    return {
      totalCount,
      totalAmount,
      waitingCount,
      waitingAmount,
      approvedPaidCount,
      approvedPaidAmount,
    }
  }, [claims, claimResponse?.totalCount])

  const statusOptions = [
    { label: 'Submitted', optionValue: 'Submitted' },
    { label: 'Under Review', optionValue: 'UnderReview' },
    { label: 'Needs Revision', optionValue: 'NeedsRevision' },
    { label: 'Approved', optionValue: 'Approved' },
    { label: 'Rejected', optionValue: 'Rejected' },
    { label: 'Paid', optionValue: 'Paid' },
  ]

  const claimTypeOptions = [
    { label: 'Benefit', optionValue: 'Benefit' },
    {
      label: 'OperationalReimbursement',
      optionValue: 'OperationalReimbursement',
    },
    {
      label: 'BusinessTripReimbursement',
      optionValue: 'BusinessTripReimbursement',
    },
  ]

  const hasActiveFilters = Boolean(
    searchQuery || statusQuery || dateRange || typeQuery,
  )

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        claimType: typeQuery,
        status: statusQuery,
        startDate: toDateOnly(dateRange?.from),
        endDate: toDateOnly(dateRange?.to),
        search: searchQuery,
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

  if (isPending) {
    return (
      <SkeletonSwap loading skeleton={<ListPageSkeleton />}>
        {null}
      </SkeletonSwap>
    )
  }

  // Runtime safety: cache could be emptied even though the query type is
  // non-nullable.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!claimResponse) return <NotFoundPage />

  const { data, errors, message, statusCode, success, ...paginationProp } =
    claimResponse

  return (
    <SkeletonSwap loading={isPending} skeleton={<ListPageSkeleton />}>
      <main className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-heading text-balance">
              My Claims
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your reimbursement submissions and benefit claim history.
            </p>
          </div>

          <Link to="/claims/create">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-2xs h-9 px-3.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Submit New Claim
            </Button>
          </Link>
        </div>

        {/* KPI Overview Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KPI 1: Total Claims */}
          <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Claims
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
              <AnimatedNumber value={metrics.totalCount} duration={400} />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums font-medium">
                {idNumberFormatter.format(metrics.totalAmount)}
              </span>{' '}
              total value
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
                {idNumberFormatter.format(metrics.waitingAmount)}
              </span>{' '}
              pending review
            </p>
          </div>

          {/* KPI 3: Approved / Paid */}
          <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Approved / Paid
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber
                value={metrics.approvedPaidCount}
                duration={400}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums font-medium">
                {idNumberFormatter.format(metrics.approvedPaidAmount)}
              </span>{' '}
              settled value
            </p>
          </div>
        </div>

        {/* Claims Table Container */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
          {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
          <div className="flex min-w-0 flex-col gap-4 p-5 border-b border-border">
            {' '}
            <div>
              <h2 className="font-semibold text-heading text-base">
                Claim Submission History
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select a claim row to inspect submission details and approval
                progress.
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
                    nullable
                    nullLabel="All Statuses"
                  />

                  <FilterSelect
                    val={typeQuery}
                    setValue={setTypeQuery}
                    options={claimTypeOptions}
                    filterLabel="Claim Type"
                    nullable
                    nullLabel="All Claims"
                  />

                  <DatePickerWithRange
                    placeholder="Claim submitted date"
                    date={dateRange}
                    setDate={setDateRange}
                  />

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(undefined)
                        setStatusQuery(undefined)
                        setDateRange(undefined)
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-237.5 text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Description / Benefit</th>
                  <th className="py-3 px-5">Transaction Date</th>
                  <th className="py-3 px-5">Claim Type</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.map((claim) => {
                  const typeBadge = getClaimTypeBadge(claim.claimType)
                  const TypeIcon = typeBadge.icon
                  const statusConfig = getStatusBadgeConfig(claim.status)
                  const tripTitle = claim.tripProposalDestination
                    ? `Business Trip to ${claim.tripProposalDestination}`
                    : claim.tripProposalDescription

                  return (
                    <tr
                      key={claim.id}
                      onClick={(event) => {
                        markRecordCardSource(event.currentTarget)
                        navigate({
                          to: '/claims/$claimId',
                          params: { claimId: claim.id },
                          ...viewTransitionNavOptions(),
                        })
                      }}
                      className="row-enter hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      {/* Keterangan / Manfaat */}
                      <td className="py-3.5 px-5 min-w-60 max-w-75">
                        <span className="block truncate whitespace-nowrap font-medium text-foreground">
                          {claim.benefitName ||
                            tripTitle ||
                            claim.description ||
                            '-'}
                        </span>

                        {claim.description &&
                          (claim.benefitName || tripTitle) && (
                            <span className="mt-0.5 block truncate whitespace-nowrap text-[11px] text-muted-foreground">
                              {claim.description}
                            </span>
                          )}
                      </td>

                      {/* Tanggal Transaksi */}
                      <td className="py-3.5 px-5 font-medium text-foreground whitespace-nowrap">
                        {formatDate(claim.transactionDate)}
                        <span className="block text-[11px] text-muted-foreground font-mono mt-0.5">
                          #{claim.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Tipe Klaim */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${typeBadge.className}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className="font-semibold text-sm tabular-nums tracking-tight text-foreground">
                          {idNumberFormatter.format(claim.amount)}
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
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          <span>Detail</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {claims.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-medium">No claim found</p>
                        <p className="text-xs text-muted-foreground/80">
                          {searchQuery
                            ? 'Try changing your search keywords or status.'
                            : 'You have no claim submission history yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info bar */}
          <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Showing {claims.length} of {claimResponse.totalCount} total
                claims
              </span>
              {/* {activeTab !== 'ALL' && (
              <span className="font-medium text-foreground">
                Active filter: {activeTab}
              </span>
            )} */}
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
