
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import {
  useGetAdminAllClaimsQuery,
  useGetAllClaimsQuery,
} from '#/features/claims/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  HandCoins,
  Plane,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

const DASHBOARD_PAGE_SIZE = 100

type DashboardRoute =
  | '/claims'
  | '/claims/create'
  | '/trip-proposals'
  | '/trip-proposals/create'
  | '/approvals/claims'
  | '/approvals/trip-proposals'

type PeriodFilter = 'month' | 'sixMonths' | 'year' | 'all'

type DashboardClaim = {
  id: string
  employeeId?: string
  employeeName?: string | null
  amount: number
  status: string
  transactionDate?: string | null
  submittedAt?: string | null
  updatedAt?: string | null
  modifiedAt?: string | null
  claimType?: string | null
  benefitName?: string | null
  tripProposalDescription?: string | null
  description?: string | null
}

type DashboardProposal = {
  id: string
  destination: string
  status: string
  totalAmount: number
  submittedAt?: string | null
  updatedAt?: string | null
  modifiedAt?: string | null
  startDate?: string
  endDate?: string
  picEmployeeId?: string | null
  picName?: string | null
}

type DashboardBenefit = {
  employeeBenefitId: string
  benefitName: string
  balance: number
  startDate?: string
  endDate?: string
  periodStartDate?: string
  periodEndDate?: string
  validFrom?: string
  validTo?: string
  createdAt?: string
}

type TodaySummaryAction = {
  id: string
  title: string
  description: string
  count: number
  to: DashboardRoute
}

type RecentAction = {
  id: string
  type: 'Claim' | 'Trip'
  title: string
  description: string
  status: string
  amount: number
  date: string
  timestamp: number
  href: string
}

type ExpenseBucket = {
  key: string
  label: string
  amount: number
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function normalizeStatus(status: unknown): string {
  return String(status ?? '')
    .replace(/[\s_-]/g, '')
    .toLowerCase()
}

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function getDateKey(value?: string | null): string {
  if (!value) return ''

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)

  return match?.[1] ?? ''
}

function getTimestamp(value?: string | null): number {
  if (!value) return 0

  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : 0
}

function formatDate(value?: string | null): string {
  const dateKey = getDateKey(value)

  if (!dateKey) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${dateKey}T12:00:00+07:00`))
}

function getJakartaDateParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
  }
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function getPeriodStartKey(period: PeriodFilter): string {
  const current = getJakartaDateParts()
  const year = Number(current.year)
  const month = Number(current.month) - 1

  if (period === 'month') {
    return `${current.year}-${current.month}-01`
  }

  if (period === 'year') {
    return `${current.year}-01-01`
  }

  if (period === 'sixMonths') {
    const start = new Date(Date.UTC(year, month - 5, 1))

    return `${start.getUTCFullYear()}-${String(
      start.getUTCMonth() + 1,
    ).padStart(2, '0')}-01`
  }

  return '0000-01-01'
}

function matchesPeriod(
  dateValue: string | null | undefined,
  period: PeriodFilter,
): boolean {
  if (period === 'all') return true

  const dateKey = getDateKey(dateValue)

  if (!dateKey) return false

  const current = getJakartaDateParts()
  const currentMonth = `${current.year}-${current.month}`

  if (period === 'month') {
    return dateKey.startsWith(currentMonth)
  }

  if (period === 'year') {
    return dateKey.startsWith(current.year)
  }

  return dateKey >= getPeriodStartKey('sixMonths')
}

function getUpdatedAt(item: {
  updatedAt?: string | null
  modifiedAt?: string | null
}): string | null {
  return item.updatedAt || item.modifiedAt || null
}

function isUpdatedToday(
  submittedAt: string | null | undefined,
  updatedAt: string | null | undefined,
  todayKey: string,
): boolean {
  if (!submittedAt || !updatedAt) return false

  return (
    getTimestamp(updatedAt) > getTimestamp(submittedAt) &&
    getDateKey(updatedAt) === todayKey
  )
}

function getPaidClaims(claims: DashboardClaim[]) {
  return claims.filter(
    (claim) => normalizeStatus(claim.status) === 'paid',
  )
}

function getPaidClaimsByPeriod(
  claims: DashboardClaim[],
  period: PeriodFilter,
): DashboardClaim[] {
  return getPaidClaims(claims).filter((claim) =>
    matchesPeriod(claim.transactionDate, period),
  )
}

function getPeriodLabel(period: PeriodFilter): string {
  switch (period) {
    case 'month':
      return 'This Month'
    case 'sixMonths':
      return 'Last 6 Months'
    case 'year':
      return 'This Year'
    default:
      return 'All Time'
  }
}

function getExpenseBuckets(
  claims: DashboardClaim[],
  period: PeriodFilter,
): ExpenseBucket[] {
  const paidClaims = getPaidClaimsByPeriod(claims, period)
  const current = getJakartaDateParts()
  const year = Number(current.year)
  const month = Number(current.month) - 1

  if (period === 'month') {
    const buckets: ExpenseBucket[] = Array.from(
      { length: 5 },
      (_, index) => ({
        key: `week-${index + 1}`,
        label: `Week ${index + 1}`,
        amount: 0,
      }),
    )

    paidClaims.forEach((claim) => {
      const day = Number(getDateKey(claim.transactionDate).slice(8, 10))

      if (!day) return

      const weekIndex = Math.min(4, Math.floor((day - 1) / 7))

      buckets[weekIndex].amount += getAmount(claim.amount)
    })

    return buckets
  }

  if (period === 'all') {
    const yearAmounts = new Map<number, number>()

    paidClaims.forEach((claim) => {
      const dateKey = getDateKey(claim.transactionDate)

      if (!dateKey) return

      const claimYear = Number(dateKey.slice(0, 4))

      yearAmounts.set(
        claimYear,
        (yearAmounts.get(claimYear) ?? 0) + getAmount(claim.amount),
      )
    })

    return Array.from(yearAmounts.entries())
      .sort(([a], [b]) => a - b)
      .map(([claimYear, amount]) => ({
        key: String(claimYear),
        label: String(claimYear),
        amount,
      }))
  }

  const firstMonth = period === 'year' ? 0 : month - 5
  const numberOfMonths = period === 'year' ? month + 1 : 6

  return Array.from({ length: numberOfMonths }, (_, index) => {
    const date = new Date(
      Date.UTC(year, firstMonth + index, 1),
    )

    const bucketYear = date.getUTCFullYear()
    const bucketMonth = date.getUTCMonth()
    const key = getMonthKey(bucketYear, bucketMonth)

    const amount = paidClaims
      .filter((claim) =>
        getDateKey(claim.transactionDate).startsWith(key),
      )
      .reduce(
        (total, claim) => total + getAmount(claim.amount),
        0,
      )

    return {
      key,
      label: new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      amount,
    }
  })
}

function getBenefitDate(
  benefit: DashboardBenefit,
  type: 'start' | 'end',
): string | null {
  if (type === 'start') {
    return (
      benefit.periodStartDate ||
      benefit.startDate ||
      benefit.validFrom ||
      benefit.createdAt ||
      null
    )
  }

  return (
    benefit.periodEndDate ||
    benefit.endDate ||
    benefit.validTo ||
    null
  )
}

function benefitMatchesPeriod(
  benefit: DashboardBenefit,
  period: PeriodFilter,
): boolean {
  if (period === 'all') return true

  const start = getDateKey(getBenefitDate(benefit, 'start'))
  const end = getDateKey(getBenefitDate(benefit, 'end'))

  const periodStart = getPeriodStartKey(period)
  const current = getJakartaDateParts()
  const today = `${current.year}-${current.month}-${current.day}`

  // Jika API tidak mengirim periode alokasi,
  // jangan sembunyikan benefit yang masih aktif.
  if (!start && !end) return true

  if (start && start > today) return false
  if (end && end < periodStart) return false

  return true
}

// =====================================================
// COMMON UI
// =====================================================

function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodFilter
  onChange: (value: PeriodFilter) => void
}) {
  return (
    <select
      aria-label="Filter period"
      value={value}
      onChange={(event) =>
        onChange(event.target.value as PeriodFilter)
      }
      className="h-8 max-w-36 cursor-pointer rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground outline-none transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
    >
      <option value="month">This Month</option>
      <option value="sixMonths">Last 6 Months</option>
      <option value="year">This Year</option>
      <option value="all">All Time</option>
    </select>
  )
}

function DashboardPanel({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="min-w-0 p-5">{children}</div>
    </section>
  )
}

// =====================================================
// TODAY SUMMARY
// =====================================================

function TodayActionButton({
  action,
}: {
  action: TodaySummaryAction
}) {
  return (
    <Link
      to={action.to}
      className="group flex min-h-[68px] min-w-0 items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-[#161B22] dark:hover:border-[#2F81F7] dark:hover:bg-[#1C2532]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800 dark:text-[#E6EDF3]">
          {action.title}
        </p>

        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-[#8B949E]">
          {action.description}
        </p>
      </div>

      <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-[#E7F0FF] px-3 text-xl font-bold tabular-nums text-[#245DA8] transition-colors group-hover:bg-[#D7E7FF] dark:bg-[#243A59] dark:text-[#79B8FF] dark:group-hover:bg-[#304D75]">
        {formatNumber(action.count)}
      </div>
    </Link>
  )
}

function TodaySummaryBanner({
  userName,
  date,
  actions,
  isEmployee,
}: {
  userName: string
  date: string
  actions: TodaySummaryAction[]
  isEmployee: boolean
}) {
  return (
    <section className="relative min-w-0 overflow-hidden rounded-2xl border border-[#D4E2F6] bg-gradient-to-br from-[#DCEAFF] via-[#EAF2FF] to-[#D3E3F8] p-5 shadow-sm dark:border-[#30363D] dark:bg-gradient-to-br dark:from-[#0D1117] dark:via-[#161B22] dark:to-[#1B2A3D] sm:p-7">
      <div className="grid min-w-0 grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
        {/* LEFT: NAME AND DATE */}
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide text-[#315B91] dark:text-[#79B8FF]">
            TODAY SUMMARY
          </p>

          <h1 className="mt-4 break-words text-2xl font-bold tracking-tight text-[#172B49] dark:text-[#E6EDF3] sm:text-3xl">
            Welcome back, {userName}!
          </h1>

          <p className="mt-2 text-sm text-[#526B8C] dark:text-[#8B949E]">
            {isEmployee
              ? "Here's what's happening with your benefits and requests."
              : "Here's what's happening with your team and approvals."}
          </p>

          <div className="mt-6 border-t border-[#BED2EF] pt-4 dark:border-[#30363D]">
            <p className="text-sm font-semibold text-[#294B76] dark:text-[#C9D8EA]">
              {date}
            </p>
          </div>
        </div>

        {/* RIGHT: ATTENTION / APPROVAL */}
        <div className="min-w-0">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-[#294B76] dark:text-[#C9D8EA]">
            {isEmployee
              ? 'NEEDS YOUR ATTENTION'
              : 'NEEDS YOUR APPROVAL'}
          </h2>

          {actions.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-2.5">
              {actions.map((action) => (
                <TodayActionButton
                  key={action.id}
                  action={action}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[90px] items-center gap-3 rounded-xl border border-[#BED2EF] bg-white/70 px-4 py-4 dark:border-[#30363D] dark:bg-[#161B22]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-[#E6EDF3]">
                  You're all caught up!
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-[#8B949E]">
                  No pending actions at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)

  let label = status

  if (normalized === 'underreview') label = 'Under Review'
  if (normalized === 'financemanagerreview') label = 'Finance Review'
  if (normalized === 'needsrevision') label = 'Needs Revision'

  let style = 'border-border bg-muted text-muted-foreground'

  if (['approved', 'paid', 'completed'].includes(normalized)) {
    style =
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
  } else if (
    [
      'submitted',
      'underreview',
      'financemanagerreview',
    ].includes(normalized)
  ) {
    style =
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
  } else if (normalized === 'needsrevision') {
    style =
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
  } else if (['rejected', 'cancelled'].includes(normalized)) {
    style =
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
  }

  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${style}`}
    >
      {label}
    </span>
  )
}

// =====================================================
// QUICK ACCESS
// =====================================================

function QuickAccessCard({
  title,
  description,
  to,
  icon: Icon,
}: {
  title: string
  description: string
  to: DashboardRoute
  icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-24 min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F81F7]/50 hover:bg-blue-50/50 dark:hover:bg-[#1C2532]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F0FF] text-[#315F9E] transition-colors group-hover:bg-[#D7E7FF] dark:bg-[#243A59] dark:text-[#79B8FF] dark:group-hover:bg-[#304D75]">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-3 min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}

// =====================================================
// EXPENSE TREND CHART
// =====================================================

function ExpenseTrendPanel({
  claims,
  title,
  description,
}: {
  claims: DashboardClaim[]
  title: string
  description: string
}) {
  const [period, setPeriod] = useState<PeriodFilter>('sixMonths')

  const paidClaims = getPaidClaimsByPeriod(claims, period)

  const buckets = getExpenseBuckets(claims, period)

  const maxAmount = Math.max(
    ...buckets.map((bucket) => bucket.amount),
    0,
  )

  const totalPaid = paidClaims.reduce(
    (total, claim) => total + getAmount(claim.amount),
    0,
  )

  const amounts = paidClaims
    .map((claim) => getAmount(claim.amount))
    .filter((amount) => amount > 0)

  const highestAmount =
    amounts.length > 0 ? Math.max(...amounts) : null

  const lowestAmount =
    amounts.length > 0 ? Math.min(...amounts) : null

  return (
    <DashboardPanel
      title={title}
      description={description}
      action={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Total paid reimbursement
          </p>

          <p className="mt-1 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {formatCurrency(totalPaid)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {paidClaims.length} paid claims · {getPeriodLabel(period)}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7F0FF] text-[#315F9E] dark:bg-[#243A59] dark:text-[#79B8FF]">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      {paidClaims.length > 0 ? (
        <>
          <div className="flex h-44 items-end justify-between gap-2 border-b border-border pb-2">
            {buckets.map((bucket) => {
              const height =
                maxAmount > 0
                  ? (bucket.amount / maxAmount) * 100
                  : 0

              const isActive =
                bucket.key === buckets[buckets.length - 1]?.key

              return (
                <div
                  key={bucket.key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`${bucket.label}: ${formatCurrency(bucket.amount)}`}
                >
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className={`w-full max-w-10 rounded-t-md transition-all ${
                        isActive
                          ? 'bg-[#2F81F7] dark:bg-[#58A6FF]'
                          : 'bg-[#B7D2F6] dark:bg-[#273E5C]'
                      }`}
                      style={{
                        height:
                          bucket.amount > 0
                            ? `${Math.max(height, 4)}%`
                            : '3px',
                      }}
                    />
                  </div>

                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                    {bucket.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />

                <p className="text-[11px] font-medium">
                  Highest Reimbursement
                </p>
              </div>

              <p className="mt-2 break-words text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {highestAmount !== null
                  ? formatCurrency(highestAmount)
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />

                <p className="text-[11px] font-medium">
                  Lowest Reimbursement
                </p>
              </div>

              <p className="mt-2 break-words text-sm font-bold text-foreground">
                {lowestAmount !== null
                  ? formatCurrency(lowestAmount)
                  : '—'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-44 flex-col items-center justify-center text-center">
          <HandCoins className="h-8 w-8 text-muted-foreground/40" />

          <p className="mt-2 text-sm font-medium text-foreground">
            No paid reimbursement found
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            No paid claims for {getPeriodLabel(period).toLowerCase()}.
          </p>
        </div>
      )}
    </DashboardPanel>
  )
}

// =====================================================
// CLAIM STATUS OVERVIEW
// =====================================================

function ClaimStatusPanel({
  claims,
  title = 'Claims Status Overview',
  description = 'Reimbursement claim distribution',
}: {
  claims: DashboardClaim[]
  title?: string
  description?: string
}) {
  const [period, setPeriod] = useState<PeriodFilter>('year')

  const filteredClaims = claims.filter((claim) =>
    matchesPeriod(
      claim.submittedAt || claim.transactionDate,
      period,
    ),
  )

  const statuses = [
    {
      key: 'submitted',
      label: 'Submitted',
      color: 'bg-amber-500',
    },
    {
      key: 'underreview',
      label: 'Under Review',
      color: 'bg-[#2F81F7]',
    },
    {
      key: 'approved',
      label: 'Approved',
      color: 'bg-emerald-500',
    },
    {
      key: 'paid',
      label: 'Paid',
      color: 'bg-teal-500',
    },
    {
      key: 'needsrevision',
      label: 'Needs Revision',
      color: 'bg-orange-500',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      color: 'bg-rose-500',
    },
  ]

  return (
    <DashboardPanel
      title={title}
      description={description}
      action={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Total claims
          </p>

          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatNumber(filteredClaims.length)}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7F0FF] text-[#315F9E] dark:bg-[#243A59] dark:text-[#79B8FF]">
          <Receipt className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        {statuses.map((status) => {
          const count = filteredClaims.filter(
            (claim) =>
              normalizeStatus(claim.status) === status.key,
          ).length

          const percentage =
            filteredClaims.length > 0
              ? (count / filteredClaims.length) * 100
              : 0

          return (
            <div key={status.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground">
                  {status.label}
                </span>

                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${status.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </DashboardPanel>
  )
}

// =====================================================
// TRIP PROPOSAL STATUS OVERVIEW
// =====================================================

function TripProposalStatusPanel({
  proposals,
}: {
  proposals: DashboardProposal[]
}) {
  const [period, setPeriod] = useState<PeriodFilter>('year')

  const filteredProposals = proposals.filter((proposal) =>
    matchesPeriod(proposal.submittedAt, period),
  )

  const statuses = [
    {
      key: 'submitted',
      label: 'Submitted',
      color: 'bg-amber-500',
    },
    {
      key: 'underreview',
      label: 'Under Review',
      color: 'bg-[#2F81F7]',
    },
    {
      key: 'financemanagerreview',
      label: 'Finance Manager Review',
      color: 'bg-violet-500',
    },
    {
      key: 'approved',
      label: 'Approved',
      color: 'bg-emerald-500',
    },
    {
      key: 'completed',
      label: 'Completed',
      color: 'bg-teal-500',
    },
    {
      key: 'needsrevision',
      label: 'Needs Revision',
      color: 'bg-orange-500',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      color: 'bg-rose-500',
    },
  ]

  return (
    <DashboardPanel
      title="Business Trip Overview"
      description="Trip proposal status distribution"
      action={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Total proposals
          </p>

          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatNumber(filteredProposals.length)}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7F0FF] text-[#315F9E] dark:bg-[#243A59] dark:text-[#79B8FF]">
          <Plane className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        {statuses.map((status) => {
          const count = filteredProposals.filter(
            (proposal) =>
              normalizeStatus(proposal.status) === status.key,
          ).length

          const percentage =
            filteredProposals.length > 0
              ? (count / filteredProposals.length) * 100
              : 0

          return (
            <div key={status.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground">
                  {status.label}
                </span>

                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${status.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </DashboardPanel>
  )
}

// =====================================================
// BENEFIT OVERVIEW
// =====================================================

function BenefitOverview({
  benefits,
}: {
  benefits: DashboardBenefit[]
}) {
  const [period, setPeriod] = useState<PeriodFilter>('all')

  const filteredBenefits = benefits.filter((benefit) =>
    benefitMatchesPeriod(benefit, period),
  )

  const totalBalance = filteredBenefits.reduce(
    (total, benefit) => total + getAmount(benefit.balance),
    0,
  )

  return (
    <DashboardPanel
      title="My Benefits"
      description="Your available benefit allocations"
      action={
        <div className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 sm:inline-flex">
            {filteredBenefits.length} Allocations
          </span>

          <PeriodFilter
            value={period}
            onChange={setPeriod}
          />
        </div>
      }
    >
      <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-[#E8F6EF] to-[#DFF1E8] p-4 dark:border-emerald-900/50 dark:from-[#142A22] dark:to-[#182A25] sm:p-5">
        <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300">
          Remaining Benefit Balance
        </p>

        <p className="mt-2 break-words text-3xl font-bold tracking-tight text-emerald-800 sm:text-4xl dark:text-emerald-300">
          {formatCurrency(totalBalance)}
        </p>

        <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
          {filteredBenefits.length} benefit allocations available
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Benefit Breakdown
          </h3>

          <span className="text-[10px] text-muted-foreground">
            {getPeriodLabel(period)}
          </span>
        </div>

        {filteredBenefits.length > 0 ? (
          <div className="space-y-1">
            {filteredBenefits.map((benefit) => (
              <div
                key={benefit.employeeBenefitId}
                className="flex min-w-0 items-center justify-between gap-3 border-b border-border py-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <p className="min-w-0 truncate text-sm font-medium text-foreground">
                    {benefit.benefitName}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(getAmount(benefit.balance))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No benefit allocations available for this period.
          </div>
        )}
      </div>
    </DashboardPanel>
  )
}

// =====================================================
// RECENT ACTIONS
// =====================================================

function RecentActions({
  actions,
  isAdmin,
}: {
  actions: RecentAction[]
  isAdmin: boolean
}) {
  return (
    <DashboardPanel
      title={isAdmin ? 'Recent Company Activities' : 'Recent Actions'}
      description="Latest claim and trip proposal activities"
      action={
        <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
          Latest 5
        </span>
      }
    >
      {actions.length > 0 ? (
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon =
              action.type === 'Claim' ? Receipt : Plane

            return (
              <a
                key={`${action.type}-${action.id}`}
                href={action.href}
                className="group flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-[#2F81F7]/40 hover:bg-blue-50/40 dark:hover:bg-[#1C2532]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {action.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {action.description}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={action.status} />

                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(action.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className="hidden text-xs font-semibold text-foreground sm:block">
                    {formatCurrency(action.amount)}
                  </p>

                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />

          <p className="mt-2 text-sm font-medium text-foreground">
            No recent activity
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Recent claims and trip proposals will appear here.
          </p>
        </div>
      )}
    </DashboardPanel>
  )
}

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery(getCurrentUser())

  const roles = (user?.roles ?? []).map((role: string) =>
    role.trim().toLowerCase(),
  )

  const isAdmin = roles.includes('admin')

  const isFinanceManager = roles.includes('finance manager')

  const isFinance =
    roles.includes('finance') && !isFinanceManager

  const isManager =
    (
      roles.includes('manager') ||
      roles.includes('project manager')
    ) && !isFinanceManager

  const isApprover =
    isAdmin || isManager || isFinance || isFinanceManager

  const isEmployee = Boolean(user) && !isApprover

  const hasUser = Boolean(user)

  // =====================================================
  // API QUERIES
  // =====================================================

  const {
    data: employeeBenefits = [],
    isLoading: isLoadingBenefits,
  } = useGetAllEmployeeBenefitsQuery(
    hasUser && !isAdmin,
  )

  const dashboardClaimParams = {
    pageNumber: 1,
    pageSize: DASHBOARD_PAGE_SIZE,
  }

  const {
    data: myClaimsResponse,
    isLoading: isLoadingMyClaims,
  } = useGetAllClaimsQuery(
    dashboardClaimParams,
    hasUser,
  )

  const {
    data: adminClaimsResponse,
    isLoading: isLoadingAdminClaims,
  } = useGetAdminAllClaimsQuery(
    dashboardClaimParams,
    isApprover,
  )

  const {
    data: proposalResponse = [],
    isLoading: isLoadingProposals,
  } = useGetAllProposalsQuery(
    isEmployee ? user?.employeeId : undefined,
    hasUser,
  )

  const myClaims = (
    myClaimsResponse?.data ?? []
  ) as DashboardClaim[]

  const allClaims = (
    isApprover
      ? adminClaimsResponse?.data ?? []
      : myClaimsResponse?.data ?? []
  ) as DashboardClaim[]

  const proposals = proposalResponse as DashboardProposal[]

  const benefitList = employeeBenefits as unknown as DashboardBenefit[]

  const currentDate = getJakartaDateParts()

  const todayKey =
    `${currentDate.year}-${currentDate.month}-${currentDate.day}`

  const currentMonthKey =
    `${currentDate.year}-${currentDate.month}`

  const currentDateObject = new Date(
    `${todayKey}T12:00:00+07:00`,
  )

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(currentDateObject)

  const currentMonthLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(currentDateObject)

  // =====================================================
  // PERSONAL CLAIMS
  // =====================================================

  const myPaidClaims = getPaidClaims(myClaims)

  const myPendingClaims = myClaims.filter((claim) =>
    ['submitted', 'underreview'].includes(
      normalizeStatus(claim.status),
    ),
  )

  const myAttentionClaims = myClaims.filter((claim) =>
    ['needsrevision', 'rejected'].includes(
      normalizeStatus(claim.status),
    ),
  )

  const myUpdatedClaims = myClaims.filter((claim) =>
    isUpdatedToday(
      claim.submittedAt,
      getUpdatedAt(claim),
      todayKey,
    ),
  )

  // =====================================================
  // PERSONAL TRIP PROPOSALS
  // =====================================================

  const myProposals = isEmployee
    ? proposals
    : proposals.filter(
        (proposal) =>
          proposal.picEmployeeId &&
          user?.employeeId &&
          proposal.picEmployeeId.toLowerCase() ===
            user.employeeId.toLowerCase(),
      )

  const myAttentionProposals = myProposals.filter((proposal) =>
    ['needsrevision', 'rejected'].includes(
      normalizeStatus(proposal.status),
    ),
  )

  const myUpdatedProposals = myProposals.filter((proposal) =>
    isUpdatedToday(
      proposal.submittedAt,
      getUpdatedAt(proposal),
      todayKey,
    ),
  )

  // =====================================================
  // APPROVAL QUEUE
  // =====================================================

  const pendingClaimApprovals = allClaims.filter((claim) => {
    const status = normalizeStatus(claim.status)

    if (
      claim.employeeId &&
      user?.employeeId &&
      claim.employeeId.toLowerCase() ===
        user.employeeId.toLowerCase()
    ) {
      return false
    }

    if (isAdmin) {
      return ['submitted', 'underreview'].includes(status)
    }

    if (isManager) {
      return status === 'submitted'
    }

    if (isFinance) {
      return status === 'underreview'
    }

    return false
  })

  const pendingTripApprovals = proposals.filter((proposal) => {
    const status = normalizeStatus(proposal.status)

    if (
      proposal.picEmployeeId &&
      user?.employeeId &&
      proposal.picEmployeeId.toLowerCase() ===
        user.employeeId.toLowerCase()
    ) {
      return false
    }

    if (isAdmin) {
      return [
        'submitted',
        'underreview',
        'financemanagerreview',
      ].includes(status)
    }

    if (isManager) {
      return status === 'submitted'
    }

    if (isFinance) {
      return status === 'underreview'
    }

    if (isFinanceManager) {
      return status === 'financemanagerreview'
    }

    return false
  })

  // =====================================================
  // TODAY SUMMARY ACTIONS
  // =====================================================

  const todayActions: TodaySummaryAction[] = []

  const addTodayAction = (
    action: TodaySummaryAction,
  ) => {
    if (action.count > 0) {
      todayActions.push(action)
    }
  }

  if (isEmployee) {
    addTodayAction({
      id: 'employee-claims-revision',
      title: 'Claims Need Your Attention',
      description: 'Claims returned or rejected by reviewers.',
      count: myAttentionClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-revision',
      title: 'Trip Proposals Need Your Attention',
      description: 'Trip proposals returned or rejected.',
      count: myAttentionProposals.length,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'employee-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check the latest changes to your claim status.',
      count: myUpdatedClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-updates',
      title: 'Trip Proposal Updates',
      description: 'Check the latest changes to your proposals.',
      count: myUpdatedProposals.length,
      to: '/trip-proposals',
    })
  } else {
    addTodayAction({
      id: 'approval-claims',
      title: 'Claims Need Your Approval',
      description: 'Employee reimbursement claims awaiting review.',
      count: pendingClaimApprovals.length,
      to: '/approvals/claims',
    })

    addTodayAction({
      id: 'approval-trips',
      title: 'Trip Proposals Need Your Approval',
      description: 'Business trip proposals awaiting your decision.',
      count: pendingTripApprovals.length,
      to: '/approvals/trip-proposals',
    })

    // Personal requests that need attention.
    addTodayAction({
      id: 'personal-claim-revision',
      title: 'Your Claims Need Attention',
      description: 'Your own claims returned or rejected.',
      count: myAttentionClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-revision',
      title: 'Your Trip Proposals Need Attention',
      description: 'Your own trip proposals returned or rejected.',
      count: myAttentionProposals.length,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'personal-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check changes to your claim status.',
      count: myUpdatedClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-updates',
      title: 'Your Trip Proposals Were Updated',
      description: 'Check changes to your trip proposals.',
      count: myUpdatedProposals.length,
      to: '/trip-proposals',
    })
  }

  // =====================================================
  // RECENT ACTIONS
  // =====================================================

  const uniqueClaims = Array.from(
    new Map(
      [...allClaims, ...myClaims].map((claim) => [
        claim.id,
        claim,
      ]),
    ).values(),
  )

  const myClaimIds = new Set(
    myClaims.map((claim) => claim.id),
  )

  const myProposalIds = new Set(
    myProposals.map((proposal) => proposal.id),
  )

  const recentActions: RecentAction[] = [
    ...uniqueClaims.map((claim): RecentAction => {
      const isOwnClaim = myClaimIds.has(claim.id)

      return {
        id: claim.id,
        type: 'Claim',
        title:
          claim.benefitName ||
          claim.tripProposalDescription ||
          claim.description ||
          'Reimbursement Claim',
        description: isOwnClaim
          ? `${claim.claimType || 'Reimbursement'} · ${formatDate(claim.transactionDate)}`
          : `${claim.employeeName || 'Employee'} · ${claim.claimType || 'Claim'}`,
        status: claim.status,
        amount: getAmount(claim.amount),
        date: claim.submittedAt || '',
        timestamp: getTimestamp(claim.submittedAt),
        href:
          isApprover && !isOwnClaim
            ? `/approvals/claims/${claim.id}`
            : `/claims/${claim.id}`,
      }
    }),

    ...proposals.map((proposal): RecentAction => {
      const isOwnProposal = myProposalIds.has(proposal.id)

      return {
        id: proposal.id,
        type: 'Trip',
        title: proposal.destination || 'Business Trip',
        description: `Business Trip · ${formatDate(proposal.submittedAt)}`,
        status: proposal.status,
        amount: getAmount(proposal.totalAmount),
        date: proposal.submittedAt || '',
        timestamp: getTimestamp(proposal.submittedAt),
        href:
          isApprover && !isOwnProposal
            ? `/approvals/trip-proposals/${proposal.id}`
            : `/trip-proposals/${proposal.id}`,
      }
    }),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  // =====================================================
  // LOADING
  // =====================================================

  const isDashboardLoading =
    isLoadingUser ||
    (
      hasUser &&
      (
        (!isAdmin && isLoadingBenefits) ||
        isLoadingMyClaims ||
        isLoadingProposals ||
        (isApprover && isLoadingAdminClaims)
      )
    )

  if (isDashboardLoading) {
    return (
      <main className="space-y-5">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-semibold text-foreground">
          User information could not be loaded.
        </p>
      </div>
    )
  }

  // =====================================================
  // QUICK ACCESS
  // =====================================================

  const quickAccessItems: {
    title: string
    description: string
    to: DashboardRoute
    icon: LucideIcon
  }[] = []

  if (isEmployee) {
    quickAccessItems.push(
      {
        title: 'Submit a Claim',
        description: 'Create a reimbursement',
        to: '/claims/create',
        icon: Plus,
      },
      {
        title: 'My Claims',
        description: 'Track your claims',
        to: '/claims',
        icon: Receipt,
      },
      {
        title: 'New Trip Proposal',
        description: 'Create a business trip',
        to: '/trip-proposals/create',
        icon: Plane,
      },
      {
        title: 'My Trip Proposals',
        description: 'Manage your trips',
        to: '/trip-proposals',
        icon: FileText,
      },
    )
  } else if (!isAdmin) {
    if (isManager || isFinance) {
      quickAccessItems.push({
        title: 'Claim Approvals',
        description: 'Review employee claims',
        to: '/approvals/claims',
        icon: Receipt,
      })
    }

    quickAccessItems.push(
      {
        title: 'Trip Approvals',
        description: 'Review trip proposals',
        to: '/approvals/trip-proposals',
        icon: Plane,
      },
      {
        title: 'My Claims',
        description: 'Track your personal claims',
        to: '/claims',
        icon: FileText,
      },
      {
        title: 'My Trip Proposals',
        description: 'View your business trips',
        to: '/trip-proposals',
        icon: CalendarDays,
      },
    )
  }

  // =====================================================
  // ROLE DISPLAY
  // =====================================================

  const roleTitle = isAdmin
    ? 'Administrator'
    : isFinanceManager
      ? 'Finance Manager'
      : isFinance
        ? 'Finance'
        : isManager
          ? 'Manager'
          : 'Employee'

  return (
    <main className="min-w-0 space-y-6">
      {/* TODAY SUMMARY */}
      <TodaySummaryBanner
        userName={user.fullName?.split(' ')[0] || 'there'}
        date={formattedDate}
        actions={todayActions}
        isEmployee={isEmployee}
      />

      {/* QUICK ACCESS - ADMIN DOES NOT NEED THIS */}
      {!isAdmin && (
        <DashboardPanel
          title="Quick Access"
          description={`Frequently used pages for ${roleTitle.toLowerCase()}`}
        >
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
            {quickAccessItems.map((item) => (
              <QuickAccessCard
                key={item.title}
                title={item.title}
                description={item.description}
                to={item.to}
                icon={item.icon}
              />
            ))}
          </div>
        </DashboardPanel>
      )}

      {/* MANAGEMENT / COMPANY ANALYTICS */}
      {isApprover && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <ClaimStatusPanel
            claims={allClaims}
            title={
              isManager
                ? 'Team Claims Overview'
                : 'Reimbursement Claims Overview'
            }
            description="Distribution of claims by approval status"
          />

          <ExpenseTrendPanel
            claims={allClaims}
            title={
              isManager
                ? 'Team Reimbursement Trend'
                : 'Company Reimbursement Trend'
            }
            description="Successfully paid reimbursement claims"
          />

          <TripProposalStatusPanel proposals={proposals} />
        </div>
      )}

      {/* PERSONAL BENEFITS + PERSONAL EXPENSE TREND */}
      {!isAdmin && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <BenefitOverview benefits={benefitList} />

          <ExpenseTrendPanel
            claims={myClaims}
            title="My Expense Trend"
            description={`Your paid reimbursement expenses · ${currentMonthLabel}`}
          />
        </div>
      )}

      {/* ADMIN ADDITIONAL FINANCIAL OVERVIEW */}
      {isAdmin && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <DashboardPanel
            title="Reimbursement Performance"
            description="Financial summary from retrieved claim records"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Total Paid Claims
                </p>

                <p className="mt-2 text-2xl font-bold text-foreground">
                  {getPaidClaims(allClaims).length}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Total Reimbursement Paid
                </p>

                <p className="mt-2 break-words text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    getPaidClaims(allClaims).reduce(
                      (total, claim) =>
                        total + getAmount(claim.amount),
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-muted-foreground">
              Based on the claims returned by the current API query.
            </p>
          </DashboardPanel>

          <ExpenseTrendPanel
            claims={allClaims}
            title="Company Expense Trend"
            description="Monthly paid reimbursement performance"
          />
        </div>
      )}

      {/* RECENT ACTIONS */}
      <RecentActions
        actions={recentActions}
        isAdmin={isAdmin}
      />

      <p className="text-right text-[10px] text-muted-foreground">
        Financial summaries are calculated from the records returned by the current API queries.
      </p>
    </main>
  )
}
