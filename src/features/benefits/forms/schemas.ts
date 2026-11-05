import z from 'zod'

export const createBenefitSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(5),
  periodType: z.string().min(3),
  categoryId: z.string(),
})

export const updateBenefitSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(5),
  periodType: z.string().min(3),
  categoryId: z.string(),
})
