export interface ClaimResponse {
  id: string
  claimType: ClaimTypeEnum
  description: string
  transactionDate: Date
  amount: number
  submittedAt: Date
  status: ClaimStatusEnum
  employeeId: string
  employeeName: string | null
  benefitName: string | null
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
  transactionDate: Date
  amount: number
  submittedAt: Date
  status: ClaimStatusEnum
  filePath: string
  employeeId: string
  employeeName: string
  employeeNumber: string
  departmentName: string
  employeeBenefitId: string
  benefitName: string
  tripProposalId: string
  approvalHistory: ApprovalHistory[]
}
interface ApprovalHistory {
  id: number
  approverId: string
  approverName: string
  decision: string
  notes: string
  approvalLevel: number
  decidedAt: Date
}
