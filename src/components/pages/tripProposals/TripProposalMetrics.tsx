
import {
  CheckCircle2,
  Clock,
  Plane,
} from 'lucide-react'

import type { TripProposalMetrics as Metrics } from '#/features/trip-proposals/hooks/useTripProposalList'

import {
  formatTripProposalCurrency,
} from '#/features/trip-proposals/utils/tripProposalUtils'

import { AnimatedNumber } from '#/components/ui/animated-number'

type Props = {
  metrics: Metrics
}

export function TripProposalMetrics({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* TOTAL PROPOSALS */}
      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Proposals
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Plane className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
          <AnimatedNumber value={metrics.totalCount} />
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums">
            {formatTripProposalCurrency(metrics.totalAmount)}
          </span>{' '}
          total estimated budget
        </p>
      </div>

      {/* WAITING FOR REVIEW */}
      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Waiting for Review
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="text-2xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
          <AnimatedNumber value={metrics.waitingCount} />
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums">
            {formatTripProposalCurrency(metrics.waitingAmount)}
          </span>{' '}
          pending review
        </p>
      </div>

      {/* APPROVED / COMPLETED */}
      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4.5 shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Approved / Completed
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
          <AnimatedNumber value={metrics.approvedCompletedCount} />
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums">
            {formatTripProposalCurrency(metrics.approvedCompletedAmount)}
          </span>{' '}
          approved / completed
        </p>
      </div>
    </div>
  )
}
