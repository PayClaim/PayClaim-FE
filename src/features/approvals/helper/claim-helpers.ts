import type {
  ApprovalRecord,
  Claim,
  ReceiptInfo,
} from '#/types/approval-action.type'

export function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function parseUtcDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null

  // Abaikan penanda timezone dari backend.
  // Jam yang dikirim sudah berupa jam WIB.
  const localDate = dateStr.replace(
    /(?:Z|[+-]\d{2}:?\d{2})$/i,
    '',
  )

  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(localDate)
    ? `${localDate}T00:00:00`
    : localDate

  const d = new Date(`${isoDate}+07:00`)

  return isNaN(d.getTime()) ? null : d
}

export function formatDateBox(dateStr?: string | null) {
  const d = parseUtcDate(dateStr)

  if (!d) {
    return {
      day: '--',
      monthYear: 'Pending',
      time: '--:--',
      longDate: '-',
    }
  }

  const day = d.toLocaleDateString('en-US', {
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

  const monthShort = d.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'Asia/Jakarta',
  })

  const monthLong = d.toLocaleDateString('en-US', {
    month: 'long',
    timeZone: 'Asia/Jakarta',
  })

  const year = d.toLocaleDateString('en-US', {
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Jakarta',
  })

  return {
    day: String(day),
    monthYear: `${monthShort}, ${year}`,
    time,
    longDate: `${day} ${monthLong}, ${year}`,
  }
}

export type DateBoxInfo = ReturnType<typeof formatDateBox>

export function getClaimTypeLabel(claimType: string) {
  if (claimType === 'OperationalReimbursement')
    return 'Operational Reimbursement'
  if (claimType === 'BusinessTripReimbursement')
    return 'Business Trip Reimbursement'
  return 'Benefit Reimbursement'
}

export function getStatusDisplayLabel(status: string) {
  if (status === 'UnderReview') return 'Under Review (Finance)'
  if (status === 'Approved') return 'Approved (Pending Payment)'
  if (status === 'NeedsRevision') return 'Needs Revision'
  return status
}

export function getDescriptionText(claim: Claim) {
  return claim.description || 'No additional description provided.'
}

export function getReceiptInfo(filePath?: string | null): ReceiptInfo {
  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : ''
  const url = filePath?.startsWith('http')
    ? filePath
    : `${backendBaseUrl}${filePath?.startsWith('/') ? '' : '/'}${filePath}`

  return {
    hasFile: Boolean(filePath),
    url,
    fileName: filePath
      ? filePath.split('/').pop() || 'Receipt_Attachment'
      : null,
    isImage: Boolean(filePath && /\.(jpeg|jpg|png|webp|gif)$/i.test(filePath)),
    isPdf: Boolean(filePath && /\.pdf$/i.test(filePath)),
  }
}

const isDecisionRejected = (dec?: unknown) => {
  if (!dec) return false
  const s = String(dec).toLowerCase()
  return s === 'rejected' || s === '2'
}

const isDecisionApproved = (dec?: unknown) => {
  if (!dec) return false
  const s = String(dec).toLowerCase()
  return s === 'approved' || s === '1'
}

export interface ApprovalState {
  level1Approval?: ApprovalRecord
  level2Approval?: ApprovalRecord
  managerDisplayName: string
  isLevel1Rejected: boolean
  isLevel2Rejected: boolean
}

export function getApprovalState(claim: Claim): ApprovalState {
  const sortedHistory = [...claim.approvalHistory].sort((a, b) => {
    const timeA = a.decidedAt ? new Date(a.decidedAt).getTime() : 0
    const timeB = b.decidedAt ? new Date(b.decidedAt).getTime() : 0
    return timeB - timeA
  })

  const level1Approval = sortedHistory.find((h) => h.approvalLevel === 1)
  const level2Approval = sortedHistory.find((h) => h.approvalLevel === 2)
  const managerDisplayName =
    level1Approval?.approverName || claim.managerName || 'Direct Manager'

  const isClaimRejected = String(claim.status).toLowerCase() === 'rejected'

  const isLevel2Rejected =
    isDecisionRejected(level2Approval?.decision) ||
    (isClaimRejected &&
      (Boolean(level2Approval) || isDecisionApproved(level1Approval?.decision)))

  const isLevel1Rejected =
    isDecisionRejected(level1Approval?.decision) ||
    (isClaimRejected && !isLevel2Rejected)

  return {
    level1Approval,
    level2Approval,
    managerDisplayName,
    isLevel1Rejected,
    isLevel2Rejected,
  }
}
