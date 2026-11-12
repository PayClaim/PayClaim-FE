import z from 'zod'

const baseTripProposalFields = {
  destination: z
    .string()
    .min(1, 'Destination is required')
    .max(150, 'Destination cannot exceed 150 characters'),

  startDate: z.string().min(1, 'Start date is required'),

  endDate: z.string().min(1, 'End date is required'),

  accommodationAmount: z
    .number()
    .positive('Accommodation amount must be greater than 0'),

  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),

  participants: z
    .array(
      z.object({
        employeeId: z.string().min(1, 'Employee is required'),
        isPic: z.boolean(),
        amount: z.number().nonnegative('Amount cannot be negative'),
      }),
    )
    .min(1, 'At least one participant is required'),
}

const applyTripProposalRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine((data: any) => data.endDate >= data.startDate, {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    })
    .refine(
      (data: any) => {
        const employeeIds = data.participants.map((p: any) => p.employeeId)
        return new Set(employeeIds).size === employeeIds.length
      },
      {
        message: 'Duplicate participant detected',
        path: ['participants'],
      },
    )
    .refine(
      (data: any) =>
        data.participants.filter((p: any) => p.isPic).length === 1,
      {
        message: 'Exactly one PIC is required',
        path: ['participants'],
      },
    )

export const createTripProposalSchema = applyTripProposalRefinements(
  z.object({
    ...baseTripProposalFields,
    file: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null && file.size > 0, {
        message: 'Proposal letter is required.',
      }),
  }),
)

export const editTripProposalSchema = applyTripProposalRefinements(
  z.object({
    ...baseTripProposalFields,
    file: z.instanceof(File).nullable().optional(),
  }),
)