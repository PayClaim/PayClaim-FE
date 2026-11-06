import z from 'zod'

export const createDepartmentSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(5),
  parentDeptId: z.string().nullable(),
})

export const updateDepartmentSchema = z.object({
  name: z.string().min(5),
  parentDeptId: z.string().nullable(),
})
