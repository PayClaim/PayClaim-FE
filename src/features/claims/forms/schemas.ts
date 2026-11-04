import z from 'zod'

export const createClaimSchema = z.object({
  claimType: z.string(),
  description: z.string().min(5),
  transactionDate: z
    .date()
    .max(new Date(), 'Date must be in the past or today.'),
  amount: z.number().positive(),
  //   employeeBenefitId: z.guid().nullable(),
  //   tripProposalId: z.guid().nullable(),
  employeeBenefitId: z.string().nullable(),
  tripProposalId: z.string().nullable(),
})
