import z from 'zod'

export const createBenefitSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(5),
  periodType: z.string().min(1, 'Period type is required'),
  categoryId: z.number(),
})

export const updateBenefitSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(5),
  periodType: z.string().min(1, 'Period type is required'),
  categoryId: z.number(),
})
