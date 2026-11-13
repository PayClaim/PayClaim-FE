export interface ClaimResponse {
  id: string
  claimType: ClaimTypeEnum
  description: string
  transactionDate: string
  amount: number
  submittedAt: string
  status: ClaimStatusEnum
  employeeId: string
  employeeName: string | null
  benefitName: string | null
  tripProposalDestination?: string | null
  tripProposalDescription: string | null
  filePath: string | null
}

export type ClaimTypeEnum =
  'Benefit' | 'OperationalReimbursement' | 'BusinessTripReimbursement'

export type ClaimStatusEnum =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsRevision'
  | 'Approved'
  | 'Rejected'
  | 'Paid'

export type ApprovalDecisionEnum =
  'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay'

export interface ClaimApprovalActionRequest {
  decision: ApprovalDecisionEnum
  notes?: string
}

export interface ClaimPayActionRequest {
  notes?: string
}

export interface MyClaimResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  success: boolean
  statusCode: number
  message: string
  data: ClaimResponse[]
  errors: null
}

export interface ClaimResponseWithHistory {
  id: string
  claimType: ClaimTypeEnum
  description: string
  transactionDate: string
  amount: number
  submittedAt: string
  status: ClaimStatusEnum
  filePath: string
  employeeId: string
  employeeName: string
  employeeNumber: string
  managerName?: string | null
  departmentName?: string | null
  employeeBenefitId: string | null
  benefitName?: string | null
  tripProposalId: string | null
  tripProposalDescription?: string | null
  tripProposalDestination?: string | null
  approvalHistory: ApprovalHistory[]
}

export interface ApprovalHistory {
  id: number
  approverId: string
  approverName: string
  decision: ApprovalDecisionEnum | string
  notes?: string | null
  approvalLevel: number
  decidedAt: string
}
