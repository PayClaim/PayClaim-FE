import z from 'zod'

export const createTripProposalSchema = z
  .object({
    destination: z
      .string()
      .min(1, 'Destination is required')
      .max(150, 'Destination cannot exceed 150 characters'),

    startDate: z.string().min(1, 'Start date is required'),

    endDate: z.string().min(1, 'End date is required'),

    description: z
      .string()
      .min(5, 'Description must be at least 5 characters')
      .max(1000, 'Description cannot exceed 1000 characters'),

    participants: z
      .array(
        z.object({
          employeeId: z.string().min(1, 'Employee is required'),
          isPic: z.boolean(),
          amount: z.number().positive('Amount must be greater than 0'),
        }),
      )
      .min(1, 'At least one participant is required'),

    file: z.instanceof(File).nullable().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      const employeeIds = data.participants.map((p) => p.employeeId)
      return new Set(employeeIds).size === employeeIds.length
    },
    {
      message: 'Duplicate participant detected',
      path: ['participants'],
    },
  )
  .refine(
    (data) => data.participants.filter((p) => p.isPic).length === 1,
    {
      message: 'Exactly one PIC is required',
      path: ['participants'],
    },
  ) 