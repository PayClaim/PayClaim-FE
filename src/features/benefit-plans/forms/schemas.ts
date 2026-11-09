import z from 'zod'

export const upsertBenefitPlanSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  positionId: z.string().min(1, 'Position is required'),
  benefitId: z.string().min(1, 'Benefit is required'),
  limitAmount: z.coerce
    .number({ invalid_type_error: 'Limit amount must be a number' })
    .positive('Limit amount must be greater than 0'),
})

export type UpsertBenefitPlanSchema = z.infer<typeof upsertBenefitPlanSchema>
