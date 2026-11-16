import type { ProposalTimelineItem } from '#/types/tripProposals.type'

export type { ProposalTimelineItem }

type ProcessTask = {
  title: string
  status: string
}

export function normalizeTimelineDecision(decision: string) {
  return decision.toLowerCase().replace(/[\s_-]/g, '')
}

export function formatDecision(decision: string) {
  const normalized = normalizeTimelineDecision(decision)

  if (normalized === 'needsrevision') {
    return 'Needs Revision'
  }

  if (normalized === 'forwardedtofinancemanager') {
    return 'Forwarded to Finance Manager'
  }

  return decision
}

export function getProcessTasks(
  stage: ProposalTimelineItem,
): ProcessTask[] {
  if (stage.isSubmission) {
    return []
  }

  const decision = normalizeTimelineDecision(stage.decision)

  let currentStatus = 'Pending Approval'

  if (stage.isPending) {
    currentStatus =
      stage.approvalLevel === 2 ? 'In Review' : 'Pending Approval'
  } else if (decision === 'approved') {
    currentStatus = 'Completed'
  } else if (decision === 'rejected') {
    currentStatus = 'Rejected'
  } else if (decision === 'needsrevision') {
    currentStatus = 'Needs Revision'
  } else if (decision === 'forwardedtofinancemanager') {
    currentStatus = 'Forwarded'
  } else if (decision === 'skipped') {
    currentStatus = 'Skipped'
  }

  if (stage.approvalLevel === 1) {
    return [
      {
        title: 'Proposal Document Collection',
        status: 'Completed',
      },
      {
        title: 'Manager Approval',
        status: currentStatus,
      },
    ]
  }

  if (stage.approvalLevel === 2) {
    return [
      {
        title: 'Accommodation & Travel Budget Verification',
        status: currentStatus,
      },
      {
        title: 'Participant Reimbursement Limit Allocation',
        status: currentStatus,
      },
    ]
  }

  if (stage.approvalLevel === 3) {
    return [
      {
        title: 'Final Budget Review',
        status: currentStatus,
      },
    ]
  }

  return []
}

export function getStageDepartment(stage: ProposalTimelineItem) {
  if (stage.isSubmission) {
    return 'Proposal Submission'
  }

  if (stage.approvalLevel === 2 || stage.approvalLevel === 3) {
    return 'Finance & Accounting Department'
  }

  return 'Manager Review'
}

export function getTaskDotClass(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-600'
    case 'Rejected':
      return 'bg-rose-600'
    case 'Needs Revision':
      return 'bg-purple-600'
    case 'Forwarded':
      return 'bg-sky-600'
    case 'Skipped':
      return 'bg-muted-foreground'
    default:
      return 'bg-amber-500'
  }
}

export function getInitials(name?: string | null) {
  if (!name) return 'U'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isImageAttachment(fileName: string) {
  return /\.(jpg|jpeg|png|webp|gif)(?:[?#].*)?$/i.test(fileName)
}
