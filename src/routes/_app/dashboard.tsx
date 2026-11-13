
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  useGetDashboardSummaryQuery,
} from '#/features/dashboard/queries/queries'
import type {
  DashboardBenefitItem,
  DashboardRecentAction,
  ExpenseTrendPeriod,
} from '#/features/dashboard/queries/queries'

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  HandCoins,
  Plane,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

type DashboardRoute =
  | '/claims'
  | '/claims/create'
  | '/trip-proposals'
  | '/trip-proposals/create'
  | '/approvals/claims'
  | '/approvals/trip-proposals'

type PeriodFilter = 'month' | 'sixMonths' | 'year' | 'all'
type BenefitFrequency = 'monthly' | 'yearly' | 'all'
type OverviewView = 'claims' | 'trips'

type TodaySummaryAction = {
  id: string
  title: string
  description: string
  count: number
  to: DashboardRoute
}

type StatusDefinition = {
  key: string
  label: string
  color: string
}

// =====================================================
// STATUS CONFIGURATION
// =====================================================

const CLAIM_STATUSES: StatusDefinition[] = [
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

const TRIP_STATUSES: StatusDefinition[] = [
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
  {
    key: 'cancelled',
    label: 'Cancelled',
    color: 'bg-rose-500',
  },
]

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

// =====================================================
// BENEFIT FREQUENCY
// =====================================================

function getBenefitFrequency(
  benefit: DashboardBenefitItem,
): Exclude<BenefitFrequency, 'all'> | null {
  const periodType = String(benefit.periodType ?? '')
    .trim()
    .toLowerCase()

  if (periodType.includes('monthly') || periodType === 'month') {
    return 'monthly'
  }

  if (
    periodType.includes('yearly') ||
    periodType.includes('annual') ||
    periodType === 'year'
  ) {
    return 'yearly'
  }

  // Fallback apabila API belum mengirimkan PeriodType.
  const start = getDateKey(benefit.startDate)
  const end = getDateKey(benefit.endDate)

  if (!start || !end) return null

  const startTime = new Date(`${start}T00:00:00Z`).getTime()
  const endTime = new Date(`${end}T00:00:00Z`).getTime()

  const durationDays = Math.round(
    (endTime - startTime) / (1000 * 60 * 60 * 24),
  )

  if (!Number.isFinite(durationDays) || durationDays < 0) {
    return null
  }

  return durationDays <= 45 ? 'monthly' : 'yearly'
}

function benefitMatchesFrequency(
  benefit: DashboardBenefitItem,
  frequency: BenefitFrequency,
): boolean {
  if (frequency === 'all') return true

  return getBenefitFrequency(benefit) === frequency
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
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
        <h2 className="min-w-0 text-base font-semibold text-foreground">
          {title}
        </h2>

        {action}
      </div>

      <div className="min-w-0 p-5 pt-3">{children}</div>
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
      className="group flex min-h-[68px] min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-3 text-left shadow-sm transition-all hover:border-amber-400 hover:bg-amber-100/80 dark:border-amber-500/35 dark:bg-amber-950/30 dark:hover:border-amber-400/60 dark:hover:bg-amber-950/45"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-amber-950/85 dark:text-amber-100">
          {action.title}
        </p>

        <p className="mt-1 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/70">
          {action.description}
        </p>
      </div>

      <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-amber-200/85 px-3 text-xl font-bold tabular-nums text-amber-900 transition-colors group-hover:bg-amber-300/90 dark:bg-amber-400/20 dark:text-amber-200 dark:group-hover:bg-amber-400/30">
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
    <section className="relative min-w-0 overflow-hidden rounded-2xl border border-[#A4C1E8] bg-gradient-to-br from-[#B6D2F7] via-[#D8E7FA] to-[#9FC1F0] p-5 shadow-sm dark:border-[#30363D] dark:bg-gradient-to-br dark:from-[#0D1117] dark:via-[#161B22] dark:to-[#1B2A3D] sm:p-6">
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-7">
        {/* LEFT CONTENT */}
        <div className="flex min-w-0 flex-col items-start justify-start self-start text-left">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">

            <span className="text-sm font-bold leading-none text-[#294B76] dark:text-[#C9D8EA]">
              {date}
            </span>
          </div>

          <h1 className="mt-4 w-full break-words text-2xl font-bold leading-tight tracking-tight text-[#172B49] dark:text-[#E6EDF3] sm:text-3xl">
            Welcome back, {userName}!
          </h1>

          <p className="mt-2 w-full max-w-md text-sm leading-relaxed text-[#405F87] dark:text-[#8B949E]">
            {isEmployee
              ? "Here's what's happening with your benefits and requests."
              : "Here's what's happening with your team and approvals."}
          </p>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full min-w-0 self-start">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-[#294B76] dark:text-[#C9D8EA]">
            {isEmployee
              ? 'NEEDS YOUR ATTENTION'
              : 'NEEDS YOUR APPROVAL'}
          </h2>

          {actions.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-2">
              {actions.map((action) => (
                <TodayActionButton
                  key={action.id}
                  action={action}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[80px] items-center gap-3 rounded-xl border border-[#B8CCE8] bg-white/75 px-4 py-3 dark:border-[#30363D] dark:bg-[#161B22]">
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
  if (normalized === 'financemanagerreview') {
    label = 'Finance Review'
  }
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCE9FA] text-[#315F9E] transition-colors group-hover:bg-[#C8DDF9] dark:bg-[#243A59] dark:text-[#79B8FF] dark:group-hover:bg-[#304D75]">
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
// STATUS DISTRIBUTION
// =====================================================

function StatusDistribution({
  countsByStatus,
  totalCount,
  statuses,
}: {
  countsByStatus: Record<string, number>
  totalCount: number
  statuses: StatusDefinition[]
}) {
  const normalizedCounts = Object.entries(countsByStatus).reduce<
    Record<string, number>
  >((acc, [key, value]) => {
    const normalized = normalizeStatus(key)
    acc[normalized] = (acc[normalized] ?? 0) + value
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {statuses.map((status) => {
        const count = normalizedCounts[status.key] ?? 0

        const percentage =
          totalCount > 0 ? (count / totalCount) * 100 : 0

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
                className={`h-full rounded-full transition-all progress-bar-fill ${status.color}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// =====================================================
// REIMBURSEMENT CLAIMS + BUSINESS TRIP OVERVIEW
// ONE PANEL WITH DROPDOWN
// =====================================================
function OverviewPanel({
  claimStatusOverview,
  tripStatusOverview,
}: {
  claimStatusOverview: Record<string, Record<string, number>>
  tripStatusOverview: Record<string, Record<string, number>>
}) {
  const [view, setView] = useState<OverviewView>('claims')
  const [period, setPeriod] = useState<PeriodFilter>('year')

  const isClaimsView = view === 'claims'

  const countsByStatus = isClaimsView
    ? claimStatusOverview[period] ?? {}
    : tripStatusOverview[period] ?? {}

  const totalCount = Object.values(countsByStatus).reduce(
    (sum, count) => sum + count,
    0,
  )

  return (
    <DashboardPanel
      title={
        isClaimsView
          ? 'Reimbursement Claims Overview'
          : 'Business Trip Overview'
      }
      action={
        <div className="flex min-w-0 items-center gap-2">
          <select
            aria-label="Select overview"
            value={view}
            onChange={(event) =>
              setView(event.target.value as OverviewView)
            }
            className="h-8 max-w-40 cursor-pointer rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground outline-none transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
          >
            <option value="claims">Reimbursement Claims</option>
            <option value="trips">Business Trips</option>
          </select>

          <PeriodFilter
            value={period}
            onChange={setPeriod}
          />
        </div>
      }
    >
      <div className="flex h-[320px] min-h-0 flex-col">
        <div className="mb-5 shrink-0">
          <p className="text-xs text-muted-foreground">
            {isClaimsView ? 'Total claims' : 'Total proposals'}
          </p>

          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatNumber(totalCount)}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isClaimsView ? (
            <StatusDistribution
              countsByStatus={countsByStatus}
              totalCount={totalCount}
              statuses={CLAIM_STATUSES}
            />
          ) : (
            <StatusDistribution
              countsByStatus={countsByStatus}
              totalCount={totalCount}
              statuses={TRIP_STATUSES}
            />
          )}
        </div>
      </div>
    </DashboardPanel>
  )
}

// =====================================================
// EXPENSE TREND CHART
// =====================================================

function ExpenseTrendPanel({
  trendByPeriod,
  title,
}: {
  trendByPeriod: Record<string, ExpenseTrendPeriod>
  title: string
}) {
  const [period, setPeriod] = useState<PeriodFilter>('sixMonths')

  const currentTrend = trendByPeriod[period] ?? {
    totalPaid: 0,
    paidCount: 0,
    highestAmount: null,
    lowestAmount: null,
    buckets: [],
  }

  const buckets = currentTrend.buckets
  const paidCount = currentTrend.paidCount
  const totalPaid = currentTrend.totalPaid
  const highestAmount = currentTrend.highestAmount
  const lowestAmount = currentTrend.lowestAmount

  const maxAmount = Math.max(
    ...buckets.map((bucket) => bucket.amount),
    0,
  )

  return (
    <DashboardPanel
      title={title}
      action={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="flex h-[320px] min-h-0 flex-col">
        <div className="mb-4 shrink-0">
          <p className="text-xs text-muted-foreground">
            Total paid reimbursement
          </p>

          <p className="mt-1 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {formatCurrency(totalPaid)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {paidCount} paid claims · {getPeriodLabel(period)}
          </p>
        </div>

        {paidCount > 0 ? (
          <>
            <div className="flex h-[148px] shrink-0 items-end justify-between gap-2 pb-2">
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
                            : 'bg-[#A9C5EC] dark:bg-[#273E5C]'
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

            <div className="mt-auto grid shrink-0 grid-cols-2 gap-3 pt-4">
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
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <HandCoins className="h-8 w-8 text-muted-foreground/40" />

            <p className="mt-2 text-sm font-medium text-foreground">
              No paid reimbursement found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              No paid claims for {getPeriodLabel(period).toLowerCase()}.
            </p>
          </div>
        )}
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
  benefits: DashboardBenefitItem[]
}) {
  const [frequency, setFrequency] = useState<BenefitFrequency>('all')

  const filteredBenefits = benefits.filter((benefit) =>
    benefitMatchesFrequency(benefit, frequency),
  )

  const totalBalance = filteredBenefits.reduce(
    (total, benefit) => total + getAmount(benefit.balance),
    0,
  )

  return (
    <DashboardPanel
      title="My Benefits"
      action={
        <div className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 sm:inline-flex">
            {filteredBenefits.length} Allocations
          </span>

          <select
            aria-label="Filter benefit frequency"
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as BenefitFrequency)
            }
            className="h-8 max-w-36 cursor-pointer rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground outline-none transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Periods</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      }
    >
      <div className="flex h-[320px] min-h-0 flex-col">
        <div className="shrink-0 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-[#E8F6EF] to-[#DFF1E8] p-4 dark:border-emerald-900/50 dark:from-[#142A22] dark:to-[#182A25]">
          <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300">
            Remaining Benefit Balance
          </p>

          <p className="mt-2 break-words text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
            {formatCurrency(totalBalance)}
          </p>

          <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
            {filteredBenefits.length} benefit allocations available
          </p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Benefit Breakdown
            </h3>

            <span className="text-[10px] text-muted-foreground">
              {frequency === 'all'
                ? 'All Periods'
                : frequency === 'monthly'
                  ? 'Monthly'
                  : 'Yearly'}
            </span>
          </div>

          {filteredBenefits.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-1">
                {filteredBenefits.map((benefit) => (
                  <div
                    key={benefit.employeeBenefitId}
                    className="flex min-w-0 items-center justify-between gap-3 border-b border-border py-3 last:border-0"
                  >
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">
                      {benefit.benefitName}
                    </p>

                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(getAmount(benefit.balance))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center text-center text-xs text-muted-foreground">
              No benefit allocations available for this period.
            </div>
          )}
        </div>
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
  actions: DashboardRecentAction[]
  isAdmin: boolean
}) {
  return (
    <DashboardPanel
      title={isAdmin ? 'Recent Company Activities' : 'Recent Actions'}
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

  const { data: summary, isLoading: isLoadingSummary } =
    useGetDashboardSummaryQuery(hasUser)

  const benefitList = summary?.benefits ?? []
  const todaySummary = summary?.todaySummary

  // =====================================================
  // DATE
  // =====================================================

  const currentDate = getJakartaDateParts()

  const todayKey =
    `${currentDate.year}-${currentDate.month}-${currentDate.day}`

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
      count: todaySummary?.myAttentionClaimsCount ?? 0,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-revision',
      title: 'Trip Proposals Need Your Attention',
      description: 'Trip proposals returned or rejected.',
      count: todaySummary?.myAttentionProposalsCount ?? 0,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'employee-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check the latest changes to your claim status.',
      count: todaySummary?.myUpdatedClaimsCount ?? 0,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-updates',
      title: 'Trip Proposal Updates',
      description: 'Check the latest changes to your proposals.',
      count: todaySummary?.myUpdatedProposalsCount ?? 0,
      to: '/trip-proposals',
    })
  } else {
    addTodayAction({
      id: 'approval-claims',
      title: 'Claims Need Your Approval',
      description: 'Employee reimbursement claims awaiting review.',
      count: todaySummary?.pendingClaimApprovalsCount ?? 0,
      to: '/approvals/claims',
    })

    addTodayAction({
      id: 'approval-trips',
      title: 'Trip Proposals Need Your Approval',
      description: 'Business trip proposals awaiting your decision.',
      count: todaySummary?.pendingTripApprovalsCount ?? 0,
      to: '/approvals/trip-proposals',
    })

    // Personal requests that need attention.
    addTodayAction({
      id: 'personal-claim-revision',
      title: 'Your Claims Need Attention',
      description: 'Your own claims returned or rejected.',
      count: todaySummary?.myAttentionClaimsCount ?? 0,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-revision',
      title: 'Your Trip Proposals Need Attention',
      description: 'Your own trip proposals returned or rejected.',
      count: todaySummary?.myAttentionProposalsCount ?? 0,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'personal-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check changes to your claim status.',
      count: todaySummary?.myUpdatedClaimsCount ?? 0,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-updates',
      title: 'Your Trip Proposals Were Updated',
      description: 'Check changes to your trip proposals.',
      count: todaySummary?.myUpdatedProposalsCount ?? 0,
      to: '/trip-proposals',
    })
  }

  const recentActions = summary?.recentActions ?? []

  // =====================================================
  // LOADING
  // =====================================================

  const isDashboardLoading =
    isLoadingUser || (hasUser && isLoadingSummary)

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
  // DASHBOARD UI
  // =====================================================

  return (
    <main className="min-w-0 space-y-5">
      {/* TODAY SUMMARY */}
      <TodaySummaryBanner
        userName={user.fullName.split(' ')[0] || 'there'}
        date={formattedDate}
        actions={todayActions}
        isEmployee={isEmployee}
      />

      {/* QUICK ACCESS - ADMIN DOES NOT NEED THIS */}
      {!isAdmin && (
        <DashboardPanel title="Quick Access">
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
          <OverviewPanel
            claimStatusOverview={summary?.claimStatusOverview ?? {}}
            tripStatusOverview={summary?.tripStatusOverview ?? {}}
          />

          <ExpenseTrendPanel
            trendByPeriod={summary?.companyExpenseTrend ?? {}}
            title={
              isManager
                ? 'Team Reimbursement Trend'
                : 'Company Reimbursement Trend'
            }
          />
        </div>
      )}

      {/* PERSONAL BENEFITS + PERSONAL EXPENSE TREND */}
      {!isAdmin && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <BenefitOverview benefits={benefitList} />

          <ExpenseTrendPanel
            trendByPeriod={summary?.myExpenseTrend ?? {}}
            title="My Expense Trend"
          />
        </div>
      )}

      {/* RECENT ACTIONS */}
      <RecentActions
        actions={recentActions}
        isAdmin={isAdmin}
      />
    </main>
  )
}
