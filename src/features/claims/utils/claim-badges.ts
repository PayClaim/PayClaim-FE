import { Briefcase, Layers, Plane, Tag } from 'lucide-react'

export function formatDate(date: string) {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getClaimTypeBadge(claimType: string) {
  switch (claimType) {
    case 'OperationalReimbursement':
      return {
        label: 'Operational',
        icon: Briefcase,
        className:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      }
    case 'BusinessTripReimbursement':
      return {
        label: 'Business Trip',
        icon: Plane,
        className:
          'bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
      }
    case 'Benefit':
      return {
        label: 'Benefit',
        icon: Tag,
        className:
          'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
      }
    default:
      return {
        label: claimType,
        icon: Layers,
        className:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      }
  }
}

export function getStatusBadgeConfig(status: string) {
  switch (status) {
    case 'Approved':
      return {
        label: 'Approved',
        className:
          'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
        dotColor: 'bg-blue-600',
      }
    case 'Paid':
      return {
        label: 'Paid',
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-600',
      }
    case 'Submitted':
      return {
        label: 'Submitted',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'UnderReview':
      return {
        label: 'Under Review',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'NeedsRevision':
      return {
        label: 'Needs Revision',
        className:
          'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
        dotColor: 'bg-orange-500',
      }
    case 'Rejected':
      return {
        label: 'Rejected',
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
