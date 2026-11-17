import { useState } from 'react'

import {
  HandCoins,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import type {
  DashboardClaim,
  DashboardProposal,
  ExpenseBucket,
  OverviewView,
  PeriodFilter,
  StatusDefinition,
} from '#/types/dashboard.type'

import {
  CLAIM_STATUSES,
  TRIP_STATUSES,
  formatCurrency,
  formatNumber,
  getAmount,
  getExpenseBuckets,
  getPaidClaimsByPeriod,
  getPeriodLabel,
  matchesPeriod,
  normalizeStatus,
} from '#/features/dashboard/utils/dashboard.utils'

import {
  DashboardPanel,
  PeriodFilterSelect,
} from '#/components/pages/dashboard/dashboardPanel'

// =====================================================
// STATUS DISTRIBUTION
// =====================================================

function StatusDistribution<T extends { status: string }>({
  items,
  statuses,
}: {
  items: T[]
  statuses: StatusDefinition[]
}) {
  return (
    <div className="space-y-4">
      {statuses.map((status) => {
        const count = items.filter(
          (item) =>
            normalizeStatus(item.status) === status.key,
        ).length

        const percentage =
          items.length > 0
            ? (count / items.length) * 100
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
  )
}

// =====================================================
// OVERVIEW PANEL
// =====================================================

function OverviewPanel({
  claims,
  proposals,
}: {
  claims: DashboardClaim[]
  proposals: DashboardProposal[]
}) {
  const [view, setView] = useState<OverviewView>('claims')
  const [period, setPeriod] = useState<PeriodFilter>('year')

  const isClaimsView = view === 'claims'

  const filteredClaims = claims.filter((claim) =>
    matchesPeriod(
      claim.submittedAt || claim.transactionDate,
      period,
    ),
  )

  const filteredProposals = proposals.filter((proposal) =>
    matchesPeriod(proposal.submittedAt, period),
  )

  const totalCount = isClaimsView
    ? filteredClaims.length
    : filteredProposals.length

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

          <PeriodFilterSelect
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
              items={filteredClaims}
              statuses={CLAIM_STATUSES}
            />
          ) : (
            <StatusDistribution
              items={filteredProposals}
              statuses={TRIP_STATUSES}
            />
          )}
        </div>
      </div>
    </DashboardPanel>
  )
}

// =====================================================
// EXPENSE TREND PANEL
// =====================================================

export function ExpenseTrendPanel({
  claims,
  title,
}: {
  claims: DashboardClaim[]
  title: string
}) {
  const [period, setPeriod] = useState<PeriodFilter>('sixMonths')

  const paidClaims = getPaidClaimsByPeriod(claims, period)

  const buckets: ExpenseBucket[] = getExpenseBuckets(
    claims,
    period,
  )

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
      action={
        <PeriodFilterSelect
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
            {paidClaims.length} paid claims · {getPeriodLabel(period)}
          </p>
        </div>

        {paidClaims.length > 0 ? (
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
// DASHBOARD ANALYTICS
// =====================================================

export type DashboardAnalyticsProps = {
  isApprover: boolean
  isManager: boolean
  allClaims: DashboardClaim[]
  proposals: DashboardProposal[]
}

export function DashboardAnalytics({
  isApprover,
  isManager,
  allClaims,
  proposals,
}: DashboardAnalyticsProps) {
  if (!isApprover) {
    return null
  }

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
      <OverviewPanel
        claims={allClaims}
        proposals={proposals}
      />

      <ExpenseTrendPanel
        claims={allClaims}
        title={
          isManager
            ? 'Team Reimbursement Trend'
            : 'Company Reimbursement Trend'
        }
      />
    </div>
  )
}