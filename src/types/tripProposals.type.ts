export type TripProposal = {
  id: string
  destination: string
  startDate: string
  endDate: string
  accommodationAmount: number
  totalAmount: number
  description?: string | null
  submittedAt: string
  status: string
  picEmployeeId?: string | null
  picName: string | null
  participantCount: number
  filePath: string | null
  myParticipantAmount?: number | null
  myRemainingBudget?: number | null
}

export enum TripProposalStatus {
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  NeedsRevision = 'NeedsRevision',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  FinanceManagerReview = 'FinanceManagerReview',
}

export function normalizeTripStatus(status?: string | null): string {
  return (status || '').replace(/[\s_-]/g, '').toLowerCase()
}

export function isTripStatus(
  status: string | undefined | null,
  target: string | string[],
): boolean {
  if (!status) return false

  const norm = normalizeTripStatus(status)

  if (Array.isArray(target)) {
    return target.some((t) => normalizeTripStatus(t) === norm)
  }

  return norm === normalizeTripStatus(target)
}

export function getProposalStatusConfig(status?: string | null) {
  const norm = normalizeTripStatus(status)

  switch (norm) {
    case 'submitted':
      return {
        label: 'Submitted',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }

    case 'underreview':
      return {
        label: 'Under Review',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }

    case 'financemanagerreview':
      return {
        label: 'Finance Review',
        className:
          'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }

    case 'approved':
      return {
        label: 'Approved',
        className:
          'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
        dotColor: 'bg-blue-600',
      }

    case 'completed':
      return {
        label: 'Completed',
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-600',
      }

    case 'needsrevision':
      return {
        label: 'Needs Revision',
        className:
          'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
        dotColor: 'bg-orange-500',
      }

    case 'rejected':
      return {
        label: 'Rejected',
        className:
          'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }

    case 'cancelled':
      return {
        label: 'Cancelled',
        className:
          'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }

    default:
      return {
        label: status || 'Pending',
        className:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-500',
      }
  }
}

export interface TripProposalParticipantInput {
  employeeId: string
  isPic: boolean
  amount: number
}

export interface CreateTripProposalFormValues {
  destination: string
  startDate: string
  endDate: string
  accommodationAmount: number
  description: string
  participants: TripProposalParticipantInput[]
  file: File | null
}

export interface ParticipantItem {
  employeeId: string
  employeeName?: string
  employeeNumber?: string
  isPic: boolean
  amount: number
}

export interface TripApprovalHistory {
  id: number
  approverId: string
  approverName: string
  decision: string
  notes?: string
  approvalLevel: number
  decidedAt: string
}

export interface TripProposalDetail {
  id: string
  destination: string
  startDate: string
  endDate: string
  accommodationAmount: number
  financeLimit: number
  totalAmount: number
  submittedAt: string
  description: string
  status: TripProposalStatus
  filePath: string
  participants: ParticipantItem[]
  approvalHistory: TripApprovalHistory[]
}

export interface TripProposalDetailResponse {
  id: string
  destination: string
  startDate: string
  endDate: string
  accommodationAmount: number
  totalAmount: number
  financeLimit: number
  submittedAt: string
  description: string
  status: TripProposalStatus
  filePath: string
  participants: TripProposalDetailParticipant[]
  approvalHistory: TripProposalApprovalHistory[]
}

export interface TripProposalDetailParticipant {
  employeeId: string
  employeeName: string | null
  employeeNumber: string | null
  isPic: boolean
  amount: number
}

export interface TripProposalApprovalHistory {
  id: number
  approverId: string
  approverName: string
  decision: string
  notes: string | null
  approvalLevel: number
  decidedAt: string
}