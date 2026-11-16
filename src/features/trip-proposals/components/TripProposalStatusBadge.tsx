
import {
  normalizeTripProposalStatus,
} from '#/features/trip-proposals/utils/tripProposalUtils'

type Props = {
  status: string
}

function getProposalStatusConfig(status: string) {
  const normalized = normalizeTripProposalStatus(status)

  switch (normalized) {
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

export function TripProposalStatusBadge({ status }: Props) {
  const config = getProposalStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />

      {config.label}
    </span>
  )
}
