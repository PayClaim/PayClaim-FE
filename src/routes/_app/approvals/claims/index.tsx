import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useGetAdminAllClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimFilterParams } from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Receipt,
  Search,
} from 'lucide-react'
import {
  formatDate,
  getClaimTypeBadge,
  getInitials,
  getStatusBadgeConfig,
} from '#/features/claims/utils/claim-badges'
import { ButtonGroup } from '#/components/ui/button-group'
import type { DateRange } from 'react-day-picker'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterSelect } from '#/components/FilterSelect'
import { DatePickerWithRange } from '#/components/DateRangePicker'
import { PaginationSection } from '#/components/PaginationSection'
import { toDateOnly } from '#/lib/utils'

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

function RouteComponent() {
  const searchRoute = Route.useSearch()
  const navigate = useNavigate()

  const {
    data: response,
    isFetching,
    isError,
    error,
  } = useGetAdminAllClaimsQuery(searchRoute)

  // Array Claim berada di dalam response.data.
  const claims = response?.data ?? []
  const initialDateRange = {
    from: searchRoute.startDate ? new Date(searchRoute.startDate) : undefined,
    to: searchRoute.endDate ? new Date(searchRoute.endDate) : undefined,
  }

  // Filter & Search states
  const [searchFilter, setSearchFilter] = useState('')

  const [claimType, setClaimType] = useState<string | undefined>(
    searchRoute.claimType,
  )
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    searchRoute.claimType,
  )
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  )

  const statusOptions = [
    { label: 'Approved', optionValue: 'Approved' },
    { label: 'Rejected', optionValue: 'Rejected' },
    { label: 'Submitted', optionValue: 'Submitted' },
    { label: 'Under Review', optionValue: 'UnderReview' },
    { label: 'Need Revision', optionValue: 'NeedRevision' },
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

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = response?.totalCount ?? claims.length
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
  }, [claims, response?.totalCount])

  const hasActiveFilters = Boolean(
    searchFilter || claimType || dateRange || statusFilter,
  )
  const applyFilterClick = () => {
    searchRoute
    navigate({
      to: '.',
      search: {
        claimType: claimType,
        search: searchFilter,
        status: statusFilter,
        startDate: toDateOnly(dateRange?.from),
        endDate: toDateOnly(dateRange?.to),
      },
    })
  }

  if (isError) {
    return (
      <main className="p-6">
        <div className="p-10 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load claims.'}
        </div>
      </main>
    )
  }

  if (isFetching || !response) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading claims...
        </div>
      </main>
    )
  }

  const { data, errors, message, statusCode, success, ...paginationProp } =
    response

  return (
    <main className="min-w-0 space-y-6">
      {/* Header */}
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

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI 1: Total Claims */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Claims
            </span>
            <div className="w-10 h-10 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
            {metrics.totalCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {idNumberFormatter.format(metrics.totalAmount)} total value
          </p>
        </div>

        {/* KPI 2: Waiting for Review */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Waiting for Review
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.waitingCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {idNumberFormatter.format(metrics.waitingAmount)} pending review
          </p>
        </div>

        {/* KPI 3: Approved / Paid */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Approved / Paid
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.approvedPaidCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {idNumberFormatter.format(metrics.approvedPaidAmount)} settled value
          </p>
        </div>
      </div>

      {/* Claims Table Container */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground text-base">
              Claim Requests
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a claim to view its details and approval workflow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonGroup>
                <div className="relative grow max-w-70 sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search employee name, or benefits..."
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
                    onClick={() => {
                      setSearchFilter('')
                      setClaimType(undefined)
                      setDateRange(undefined)
                      setStatusFilter(undefined)
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
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
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
                {claims.map((claim) => {
                  const typeBadge = getClaimTypeBadge(claim.claimType)
                  const TypeIcon = typeBadge.icon
                  const statusConfig = getStatusBadgeConfig(claim.status)

                  return (
                    <tr
                      key={claim.id}
                      onClick={() =>
                        navigate({
                          to: '/approvals/claims/$claimId',
                          params: {
                            claimId: claim.id,
                          },
                        })
                      }
                      className="cursor-pointer transition-colors hover:bg-muted/50 group"
                    >
                      {/* Employee with Initials Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                            {getInitials(claim.employeeName)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">
                              {claim.employeeName || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Claim Type Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${typeBadge.className}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{typeBadge.label}</span>
                        </span>
                      </td>

                      {/* Benefit / Trip details with Claim ID code */}
                      <td className="max-w-65 truncate px-5 py-4">
                        <div className="font-medium text-foreground truncate">
                          {claim.benefitName ||
                            claim.tripProposalDescription ||
                            'Operational Expense'}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          ID: CLM-{claim.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>

                      {/* Transaction Date */}
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {formatDate(claim.transactionDate)}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-mono font-bold text-foreground">
                        {idNumberFormatter.format(claim.amount)}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {formatDate(claim.submittedAt)}
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

                      {/* Row Action Arrow */}
                      <td className="px-5 py-4 text-right">
                        <ArrowRight
                          size={18}
                          className="ml-auto text-muted-foreground/60 group-hover:text-foreground transition-colors"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Menampilkan {claims.length} dari {response.totalCount} total
                  employees
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
