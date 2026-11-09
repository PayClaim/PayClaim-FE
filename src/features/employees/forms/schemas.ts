import { toDateOnly } from '#/lib/utils'
import z from 'zod'

export const createEmployeeSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address format'),
  hireDate: z
    .string()
    .min(1, 'Hire date is required')
    .refine(
      (s) => s <= toDateOnly(new Date()),
      'Hire date cannot be in the future',
    ),
  positionId: z.string().min(1, 'Employee must have position'),
  departmentId: z.string().min(1, 'Employee must have department'),
  managerId: z.string().nullable(),
})

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address format'),
  hireDate: z
    .string()
    .min(1, 'Hire date is required')
    .refine(
      (s) => s <= toDateOnly(new Date()),
      'Hire date cannot be in the future',
    ),
  positionId: z.string().min(1, 'Employee must have position'),
  departmentId: z.string().min(1, 'Employee must have department'),
  managerId: z.string().nullable(),
  isActive: z.boolean(),
})
