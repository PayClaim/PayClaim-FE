import { toDateOnly } from '#/lib/utils'
import z from 'zod'

export const createClaimSchema = z.object({
  employeeId: z.string().min(1),
  claimType: z.string(),
  description: z.string().min(5),
  transactionDate: z.iso
    .date({ message: 'Hire date is required' }) // format YYYY-MM-DD
    .refine(
      (s) => s <= toDateOnly(new Date()),
      'Date must be in the past or today.',
    ),
  amount: z.number().positive(),
  //   employeeBenefitId: z.guid().nullable(),
  //   tripProposalId: z.guid().nullable(),
  employeeBenefitId: z.string().nullable(),
  tripProposalId: z.string().nullable(),
  receiptFile: z.file().nullable(),
})
