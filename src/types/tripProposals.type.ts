export type TripProposal = {
  id: string
  destination: string
  startDate: string
  endDate: string
  totalAmount: number
  submittedAt: string
  status: string
  picName: string | null
  participantCount: number
  filePath: string | null
}

export enum TripProposalStatus {
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  NeedsRevision = 'Needs Revision',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  FinanceManagerReview = 'Review by Finance Manager',
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

export interface TripProposalDetailResponse {
  id: string
  destination: string
  startDate: string
  endDate: string
  totalAmount: number
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