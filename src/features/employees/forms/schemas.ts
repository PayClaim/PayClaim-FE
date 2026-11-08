import { toDateOnly } from '#/lib/utils'
import z from 'zod'

export const createEmployeeSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  hireDate: z
    .date({ message: 'Hire date is required' })
    .refine((d) => d <= new Date(), 'Hire date cannot be in the future'),
  positionId: z.string().min(1, 'Employee must have position'),
  departmentId: z.string().min(1, 'Employee must have department'),
  managerId: z.string().nullable(),
})

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  hireDate: z.iso
    .date({ message: 'Hire date is required' }) // format YYYY-MM-DD
    .refine(
      (s) => s <= toDateOnly(new Date()),
      'Hire date cannot be in the future',
    ),
  positionId: z.string().min(1, 'Employee must have position'),
  departmentId: z.string().min(1, 'Employee must have department'),
  managerId: z.string().nullable(),
  isActive: z.boolean(),
})
