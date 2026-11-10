import { toDateOnly } from '#/lib/utils'
import z from 'zod'

export const createClaimSchema = z
  .object({
    claimType: z.string(),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    transactionDate: z.string().min(1, 'Transaction date is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    employeeBenefitId: z.string().nullable(),
    tripProposalId: z.string().nullable(),
    receiptFile: z.instanceof(File).nullable(),
  })
  .refine(
    (data) => {
      return data.transactionDate <= toDateOnly(new Date())
    },
    {
      message: 'Transaction date cannot be in the future',
      path: ['transactionDate'],
    },
  )
  .refine(
    (data) => {
      if (data.claimType === 'Benefit') {
        return !!data.employeeBenefitId
      }
      return true
    },
    {
      message: 'Please select a benefit',
      path: ['employeeBenefitId'],
    },
  )
  .refine(
    (data) => {
      if (data.claimType === 'BusinessTripReimbursement') {
        return !!data.tripProposalId
      }
      return true
    },
    {
      message: 'Please select an approved trip proposal',
      path: ['tripProposalId'],
    },
  )

export const approvalClaimSchema = z
  .object({
    decision: z.enum(['Approved', 'Rejected', 'NeedsRevision', 'Pay']),
    notes: z.string(),
  })
  .refine((data) => {
    if (data.decision === 'NeedsRevision' && data.notes.trim().length <= 2) {
      return {
        message:
          'Notes must be at least 10 characters when requesting revision',
        path: ['notes'],
      }
    }
  })
