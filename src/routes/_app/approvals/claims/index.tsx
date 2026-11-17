import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useGetAdminAllClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimFilterParams } from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'

import { useQuery } from '@tanstack/react-query'
import type { DateRange } from 'react-day-picker'

import { getCurrentUser } from '#/features/auth/queries/queries'

import {
  formatDate,
  getClaimTypeBadge,
  getInitials,
} from '#/features/claims/utils/claim-badges'

import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterSelect } from '#/components/FilterSelect'
import { DatePickerWithRange } from '#/components/DateRangePicker'
import { PaginationSection } from '#/components/PaginationSection'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Receipt,
  Search,
} from 'lucide-react'

// =====================================================
// ROUTE
// =====================================================
import { toDateOnly } from '#/lib/utils'
import {
  markRecordCardSource,
  viewTransitionNavOptions,
} from '#/lib/view-transition'

export const Route = createFileRoute('/_app/approvals/claims/')({
  validateSearch: (s) => s as ClaimFilterParams,

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

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function normalizeStatus(status: unknown): string {
  return String(status ?? '')
    .replace(/[\s_-]/g, '')
    .toLowerCase()
}

function getSubmittedAtTime(date?: string | null): number {
  if (!date) return 0

  const timestamp = new Date(date).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getClaimApprovalStatusConfig(
  status: string,
  roles: string[],
  isOwnClaim: boolean,
) {
  const normalized = normalizeStatus(status)

  const roleLower = roles.map((role) => role.trim().toLowerCase())

  const isAdmin = roleLower.includes('admin')

  const isFinanceManager = roleLower.includes('finance manager')

  const isManager =
    (roleLower.includes('manager') || roleLower.includes('project manager')) &&
    !isFinanceManager

  const isFinance = roleLower.includes('finance')

  const needsMyApproval =
    !isOwnClaim &&
    ((normalized === 'submitted' && (isAdmin || isManager)) ||
      (normalized === 'underreview' && (isAdmin || isFinance)))

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

    case 'approved':
      return {
        label: 'Approved',
        className:
          'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
      }

    case 'paid':
      return {
        label: 'Paid',
        className:
          'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
        dotColor: 'bg-teal-500',
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
// MAIN COMPONENT
// =====================================================

function RouteComponent() {
  const searchRoute = Route.useSearch()
  const navigate = useNavigate()

  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  const { data: user, isLoading: isLoadingUser } = useQuery(getCurrentUser())

  const roles = (user?.roles ?? []).map((role) => role.trim().toLowerCase())

  const isAdmin = roles.includes('admin')

  // =====================================================
  // CLAIMS QUERY
  // =====================================================

  const {
    data: response,
    isPending,
    isError,
    error,
  } = useGetAdminAllClaimsQuery(searchRoute)

  const claims = response?.data ?? []

  // =====================================================
  // SORT CLAIMS
  // =====================================================

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      const aIsOwnClaim = Boolean(
        a.employeeId &&
        user?.employeeId &&
        a.employeeId.toLowerCase() === user.employeeId.toLowerCase(),
      )

      const bIsOwnClaim = Boolean(
        b.employeeId &&
        user?.employeeId &&
        b.employeeId.toLowerCase() === user.employeeId.toLowerCase(),
      )

      const aWaiting =
        getClaimApprovalStatusConfig(a.status, roles, aIsOwnClaim).label ===
        'Waiting for Your Approval'

      const bWaiting =
        getClaimApprovalStatusConfig(b.status, roles, bIsOwnClaim).label ===
        'Waiting for Your Approval'

      // 1. Waiting for Your Approval first.
      if (aWaiting !== bWaiting) {
        return aWaiting ? -1 : 1
      }

      // 2. Sort by SubmittedAt, newest first.
      return (
        getSubmittedAtTime(b.submittedAt) - getSubmittedAtTime(a.submittedAt)
      )
    })
  }, [claims, roles, user?.employeeId])

  // =====================================================
  // FILTER STATES
  // =====================================================

  const initialDateRange = {
    from: searchRoute.startDate ? new Date(searchRoute.startDate) : undefined,
    to: searchRoute.endDate ? new Date(searchRoute.endDate) : undefined,
  }

  const [searchFilter, setSearchFilter] = useState('')

  const [claimType, setClaimType] = useState<string | undefined>(
    searchRoute.claimType,
  )

  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    searchRoute.status,
  )

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  )

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const statusOptions = [
    { label: 'Approved', optionValue: 'Approved' },
    { label: 'Rejected', optionValue: 'Rejected' },
    { label: 'Submitted', optionValue: 'Submitted' },
    { label: 'Under Review', optionValue: 'UnderReview' },
    { label: 'Needs Revision', optionValue: 'NeedsRevision' },
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

  // =====================================================
  // KPI CALCULATIONS
  // =====================================================

  const metrics = useMemo(() => {
    const totalCount = response?.totalCount ?? claims.length

    const totalAmount = claims.reduce(
      (sum, claim) => sum + (claim.amount || 0),
      0,
    )

    // Only count claims that require action from the logged-in user.
    const waitingClaims = claims.filter((claim) => {
      const isOwnClaim = Boolean(
        claim.employeeId &&
        user?.employeeId &&
        claim.employeeId.toLowerCase() === user.employeeId.toLowerCase(),
      )

      return (
        getClaimApprovalStatusConfig(claim.status, roles, isOwnClaim).label ===
        'Waiting for Your Approval'
      )
    })

    const waitingCount = waitingClaims.length

    const waitingAmount = waitingClaims.reduce(
      (sum, claim) => sum + (claim.amount || 0),
      0,
    )

    const approvedPaidClaims = claims.filter((claim) =>
      ['approved', 'paid'].includes(normalizeStatus(claim.status)),
    )

    const approvedPaidCount = approvedPaidClaims.length

    const approvedPaidAmount = approvedPaidClaims.reduce(
      (sum, claim) => sum + (claim.amount || 0),
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
  }, [claims, response?.totalCount, user?.employeeId, roles])

  // =====================================================
  // FILTER ACTIONS
  // =====================================================

  const hasActiveFilters = Boolean(
    searchFilter || claimType || dateRange || statusFilter,
  )

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        claimType,
        search: searchFilter,
        status: statusFilter,
        startDate: toDateOnly(dateRange?.from),
        endDate: toDateOnly(dateRange?.to),
      },
    })
  }

  const resetFilters = () => {
    setSearchFilter('')
    setClaimType(undefined)
    setDateRange(undefined)
    setStatusFilter(undefined)

    navigate({
      to: '.',
      search: {
        claimType: undefined,
        search: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
      },
    })
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <main className="p-6">
        <div className="p-10 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load claims.'}
        </div>
      </main>
    )
  }

  if (isPending || isLoadingUser || !response) {
    return (
      <main className="space-y-3 py-20 text-center">
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading claims...
        </div>
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
  } = response

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <main className="min-w-0 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Receipt size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Approval Claims
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review and process employee reimbursement claims.
          </p>
        </div>
      </div>

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL CLAIMS */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Claims
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
            {metrics.totalCount}
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">
              {idNumberFormatter.format(metrics.totalAmount)}
            </span>{' '}
            total value
          </p>
        </div>

        {/* WAITING FOR YOUR APPROVAL */}
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
              {idNumberFormatter.format(metrics.waitingAmount)}
            </span>{' '}
            value awaiting your decision
          </p>
        </div>

        {/* APPROVED / PAID */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Approved / Paid
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.approvedPaidCount}
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">
              {idNumberFormatter.format(metrics.approvedPaidAmount)}
            </span>{' '}
            settled value
          </p>
        </div>
      </div>

      {/* CLAIMS TABLE */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* TABLE HEADER & TOOLBAR */}
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 xl:flex-row xl:items-center">
          <div>
            <h2 className="font-semibold text-heading text-base text-balance">
              Claim Requests
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a claim to view its details and approval workflow.
            </p>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonGroup>
                <div className="relative max-w-70 grow sm:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(event) => setSearchFilter(event.target.value)}
                    placeholder="Search employee name, or benefits..."
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
                  val={statusFilter}
                  setValue={setStatusFilter}
                  options={statusOptions}
                  filterLabel="Status"
                  nullable
                  nullLabel="All Statuses"
                />

                <FilterSelect
                  val={claimType}
                  setValue={setClaimType}
                  options={claimTypeOptions}
                  filterLabel="Claim Type"
                  nullable
                  nullLabel="All Claims"
                />

                <DatePickerWithRange date={dateRange} setDate={setDateRange} />

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
        {claims.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={36} className="mx-auto text-muted-foreground/40" />

            <h3 className="mt-3 font-medium text-foreground">
              No claims found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {searchFilter
                ? 'No claims match your filter criteria.'
                : 'There are currently no claims available for review.'}
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-262.5 whitespace-nowrap text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Employee</th>

                  <th className="px-5 py-3.5 font-medium">Claim Type</th>

                  <th className="px-5 py-3.5 font-medium">
                    Benefit / Trip Details
                  </th>

                  <th className="px-5 py-3.5 font-medium">Invoice Date</th>

                  <th className="px-5 py-3.5 font-medium">Amount</th>

                  <th className="px-5 py-3.5 font-medium">Submitted</th>

                  <th className="px-5 py-3.5 font-medium">Status</th>

                  <th className="px-5 py-3.5" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {sortedClaims.map((claim) => {
                  const typeBadge = getClaimTypeBadge(claim.claimType)

                  const TypeIcon = typeBadge.icon

                  const isOwnClaim = Boolean(
                    claim.employeeId &&
                    user?.employeeId &&
                    claim.employeeId.toLowerCase() ===
                      user.employeeId.toLowerCase(),
                  )

                  const statusConfig = getClaimApprovalStatusConfig(
                    claim.status,
                    roles,
                    isOwnClaim,
                  )

                  return (
                    <tr
                      key={claim.id}
                      onClick={(event) => {
                        markRecordCardSource(event.currentTarget)
                        navigate({
                          to: '/approvals/claims/$claimId',
                          params: {
                            claimId: claim.id,
                          },
                          ...viewTransitionNavOptions(),
                        })
                      }}
                      className="row-enter cursor-pointer transition-colors hover:bg-muted/50 group"
                    >
                      {/* EMPLOYEE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                            {getInitials(claim.employeeName)}
                          </div>

                          <div>
                            <p className="text-sm leading-tight font-semibold text-foreground">
                              {claim.employeeName || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CLAIM TYPE */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${typeBadge.className}`}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          <span>{typeBadge.label}</span>
                        </span>
                      </td>

                      {/* BENEFIT / TRIP DETAILS */}
                      <td className="max-w-65 truncate px-5 py-4">
                        <div className="truncate font-medium text-foreground">
                          {claim.benefitName ||
                            (claim.tripProposalDestination
                              ? `Business Trip to ${claim.tripProposalDestination}`
                              : claim.tripProposalDescription) ||
                            'Operational Expense'}
                        </div>
                      </td>

                      {/* TRANSACTION DATE */}
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {formatDate(claim.transactionDate)}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold tracking-tight text-foreground tabular-nums">
                          {idNumberFormatter.format(claim.amount)}
                        </span>
                      </td>

                      {/* SUBMITTED DATE */}
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {formatDate(claim.submittedAt)}
                      </td>

                      {/* STATUS */}
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

                      {/* ROW ACTION */}
                      <td className="px-5 py-4 text-right">
                        <ArrowRight
                          size={18}
                          className="ml-auto text-muted-foreground/60 transition-colors group-hover:text-foreground"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Showing {claims.length} of {response.totalCount} total claims
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
