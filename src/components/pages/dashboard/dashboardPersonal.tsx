import { useState } from 'react'

import {
  ArrowRight,
  FileText,
  Plane,
  Receipt,
} from 'lucide-react'

import type {
  BenefitFrequency,
  DashboardBenefit,
  DashboardClaim,
  RecentAction,
} from '#/types/dashboard.type'

import {
  benefitMatchesFrequency,
  formatCurrency,
  formatDate,
  getAmount,
  getApprovalStatusConfig,
} from '#/features/dashboard/utils/dashboard.utils'

import { DashboardPanel } from '#/components/pages/dashboard/dashboardPanel'
import { ExpenseTrendPanel } from '#/components/pages/dashboard/dashboardAnalytics'

// =====================================================
// BENEFIT OVERVIEW
// =====================================================

function BenefitOverview({
  benefits,
}: {
  benefits: DashboardBenefit[]
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
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
  type,
  isOwn,
  roles,
}: {
  status: string
  type: 'Claim' | 'Trip'
  isOwn: boolean
  roles: string[]
}) {
  const statusConfig = getApprovalStatusConfig({
    status,
    type,
    isOwn,
    roles,
  })

  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusConfig.style}`}
    >
      {statusConfig.label}
    </span>
  )
}

// =====================================================
// RECENT ACTIONS
// =====================================================

function RecentActions({
  actions,
  isAdmin,
  roles,
}: {
  actions: RecentAction[]
  isAdmin: boolean
  roles: string[]
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
                      <StatusBadge
                        status={action.status}
                        type={action.type}
                        isOwn={action.isOwn}
                        roles={roles}
                      />

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
// DASHBOARD PERSONAL
// =====================================================

export type DashboardPersonalProps = {
  isAdmin: boolean
  benefits: DashboardBenefit[]
  myClaims: DashboardClaim[]
  recentActions: RecentAction[]
  roles: string[]
}

export function DashboardPersonal({
  isAdmin,
  benefits,
  myClaims,
  recentActions,
  roles,
}: DashboardPersonalProps) {
  return (
    <>
      {!isAdmin && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <BenefitOverview benefits={benefits} />

          <ExpenseTrendPanel
            claims={myClaims}
            title="My Expense Trend"
          />
        </div>
      )}

      <RecentActions
        actions={recentActions}
        isAdmin={isAdmin}
        roles={roles}
      />
    </>
  )
}