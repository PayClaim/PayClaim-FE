export interface ClaimResponse {
  id: string
  claimType: string
  description: string
  transactionDate: Date
  amount: number
  submittedAt: Date
  status: string
  employeeId: string
  employeeName?: string
  benefitName?: string
  tripProposalDescription?: string
  filePath?: string
}
