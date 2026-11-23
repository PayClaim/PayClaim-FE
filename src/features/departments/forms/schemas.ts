import z from 'zod'

export const createDepartmentSchema = z.object({
  id: z.string().min(2, 'Department ID must be at least 2 characters'),
  name: z.string().min(5, 'Department name must be at least 5 characters'),
  parentDeptId: z.string().nullable(),
})

export const updateDepartmentSchema = z.object({
  name: z.string().min(5),
  parentDeptId: z.string().nullable(),
})
