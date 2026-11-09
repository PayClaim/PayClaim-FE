export interface TripProposal {
  id: string
  destination: string
  startDate: string
  endDate: string
  totalAmount: number
  submittedAt: string
  status: TripProposalStatus
  picName?: string
  participantCount: number
  filePath?: string
}

export type TripProposalStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'FinanceManagerReview'
  | 'NeedsRevision'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled'

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
  decision: 'Approved' | 'Rejected' | 'NeedsRevision'
  notes?: string
  approvalLevel: number
  decidedAt: string
}

export interface TripProposalDetail {
  id: string
  destination: string
  startDate: string
  endDate: string
  totalAmount: number
  submittedAt: string
  description: string
  status: TripProposalStatus
  filePath: string
  participants: ParticipantItem[]
  approvalHistory: TripApprovalHistory[]
}
