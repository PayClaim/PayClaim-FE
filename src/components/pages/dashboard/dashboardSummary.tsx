import { Link } from '@tanstack/react-router'

import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

import type {
  DashboardClaim,
  QuickAccessItem,
  TodaySummaryAction,
  DashboardProposal,
} from '#/types/dashboard.type'

import { DashboardPanel } from '#/components/pages/dashboard/dashboardPanel'
import { AnimatedNumber } from '#/components/ui/animated-number'
import { formatNumber } from '#/features/dashboard/utils/dashboard.utils'

// =====================================================
// TODAY ACTION BUTTON
// =====================================================
function TodayActionButton({
  action,
}: {
  action: TodaySummaryAction
}) {
  const isAttentionAction =
    /(claim|claims|trip)-revision/.test(action.id)

  return (
    <Link
      to={action.to}
      className={`group flex min-h-[68px] min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-3 text-left shadow-sm transition-all hover:border-amber-400 hover:bg-amber-100/80 ${
        isAttentionAction
          ? 'dark:border-amber-600/65 dark:bg-amber-900/40 dark:hover:border-amber-500/80 dark:hover:bg-amber-900/55'
          : 'dark:border-amber-500/35 dark:bg-amber-950/30 dark:hover:border-amber-400/60 dark:hover:bg-amber-950/45'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-bold text-amber-950/85 ${
            isAttentionAction
              ? 'dark:text-amber-100'
              : 'dark:text-amber-100'
          }`}
        >
          {action.title}
        </p>

        <p
          className={`mt-1 text-[11px] leading-relaxed text-amber-800/80 ${
            isAttentionAction
              ? 'dark:text-amber-200/85'
              : 'dark:text-amber-200/70'
          }`}
        >
          {action.description}
        </p>
      </div>

      <div
        className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-amber-200/85 px-3 text-xl font-bold tabular-nums text-amber-900 transition-colors group-hover:bg-amber-300/90 ${
          isAttentionAction
            ? 'dark:bg-amber-500/30 dark:text-amber-100 dark:group-hover:bg-amber-500/40'
            : 'dark:bg-amber-400/20 dark:text-amber-200 dark:group-hover:bg-amber-400/30'
        }`}
      >
        {formatNumber(action.count)}
      </div>
    </Link>
  )
}

// =====================================================
// TODAY SUMMARY BANNER
// =====================================================

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

        <div className="w-full min-w-0 self-start">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-[#294B76] dark:text-[#C9D8EA]">
            {isEmployee ? 'NEEDS YOUR ATTENTION' : 'NEEDS YOUR APPROVAL'}
          </h2>

          {actions.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-2">
              {actions.map((action) => (
                <TodayActionButton key={action.id} action={action} />
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
// REJECTED NOTIFICATIONS
// =====================================================

function RejectedNotifications({
  claims,
  proposals,
  onDismiss,
}: {
  claims: DashboardClaim[]
  proposals: DashboardProposal[]
  onDismiss: (ids: string[]) => void
}) {
  if (claims.length === 0 && proposals.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-11 w-full flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-rose-200 bg-rose-100/90 px-4 py-2.5 dark:border-rose-900/60 dark:bg-rose-950/40">
      {claims.length > 0 && (
        <a
          href={claims.length === 1 ? `/claims/${claims[0].id}` : '/claims'}
          onClick={() => onDismiss(claims.map((claim) => `claim:${claim.id}`))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 transition-colors hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-200"
        >
          <span>
            {formatNumber(claims.length)} rejected{' '}
            {claims.length === 1 ? 'claim' : 'claims'}
          </span>

          <span className="font-normal underline underline-offset-2">
            View details
          </span>
        </a>
      )}

      {proposals.length > 0 && (
        <a
          href={
            proposals.length === 1
              ? `/trip-proposals/${proposals[0].id}`
              : '/trip-proposals'
          }
          onClick={() =>
            onDismiss(proposals.map((proposal) => `trip:${proposal.id}`))
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 transition-colors hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-200"
        >
          <span>
            {formatNumber(proposals.length)} rejected{' '}
            {proposals.length === 1 ? 'trip proposal' : 'trip proposals'}
          </span>

          <span className="font-normal underline underline-offset-2">
            View details
          </span>
        </a>
      )}
    </div>
  )
}

// =====================================================
// QUICK ACCESS CARD
// =====================================================

function QuickAccessCard({
  title,
  description,
  to,
  icon: Icon,
}: QuickAccessItem) {
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
// DASHBOARD SUMMARY
// =====================================================

export type DashboardSummaryProps = {
  userName: string
  formattedDate: string
  todayActions: TodaySummaryAction[]
  isEmployee: boolean

  rejectedClaims: DashboardClaim[]
  rejectedProposals: DashboardProposal[]
  onDismissRejected: (ids: string[]) => void

  quickAccessItems: QuickAccessItem[]
  isAdmin: boolean
}

export function DashboardSummary({
  userName,
  formattedDate,
  todayActions,
  isEmployee,
  rejectedClaims,
  rejectedProposals,
  onDismissRejected,
  quickAccessItems,
  isAdmin,
}: DashboardSummaryProps) {
  return (
    <>
      <TodaySummaryBanner
        userName={userName}
        date={formattedDate}
        actions={todayActions}
        isEmployee={isEmployee}
      />

      <RejectedNotifications
        claims={rejectedClaims}
        proposals={rejectedProposals}
        onDismiss={onDismissRejected}
      />

      {!isAdmin && (
        <DashboardPanel title="Quick Access">
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
            {quickAccessItems.map((item) => (
              <QuickAccessCard key={item.title} {...item} />
            ))}
          </div>
        </DashboardPanel>
      )}
    </>
  )
}
