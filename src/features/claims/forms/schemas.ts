import { toDateOnly } from '#/lib/utils'
import z from 'zod'

export const createClaimBlurSchema = z
  .object({
    claimType: z.string(),
    description: z
      .string()
      .refine(
        (val) => val.trim().length === 0 || val.trim().length >= 5,
        { message: 'Description must be at least 5 characters' },
      ),
    transactionDate: z.string().min(1, 'Transaction date is required'),
    amount: z.number(),
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

export const createClaimSchema = createClaimBlurSchema
  .refine((data) => data.description.trim().length >= 5, {
    message: 'Description must be at least 5 characters',
    path: ['description'],
  })
  .refine((data) => data.amount > 0, {
    message: 'Amount must be greater than 0',
    path: ['amount'],
  })

export const approvalClaimSchema = z
  .object({
    decision: z.enum(['Approved', 'Rejected', 'NeedsRevision', 'Pay']),
    notes: z.string().nullable(),
  })
  .refine(
    (data) => {
      if (data.decision === 'Rejected' || data.decision === 'NeedsRevision') {
        return !!data.notes && data.notes.trim().length > 0
      }
      return true
    },
    {
      message: 'Notes are required for Reject and Request Revision',
      path: ['notes'],
    },
  )
