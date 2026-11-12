import { useAppForm } from '#/hooks/app.form'
import { useNavigate } from '@tanstack/react-router'
import { useCreateTripProposalMutation, useUpdateTripProposalMutation } from '#/features/trip-proposals/queries/queries'
import { createTripProposalSchema, editTripProposalSchema } from './schemas'
import { toast } from 'sonner'
import { getFriendlyErrorMessage } from '#/lib/error'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'

export const createTripProposalForm = (currentEmployeeId: string) => {
  const mutation = useCreateTripProposalMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      destination: '',
      startDate: '',
      endDate: '',
      accommodationAmount: 0,
      description: '',
      participants: [
        {
          employeeId: currentEmployeeId,
          isPic: true,
          amount: 0,
        },
      ] as TripProposalParticipantInput[],
      file: null as File | null,
    },

    validators: {
      onSubmit: createTripProposalSchema,
    },

    onSubmit: async ({ value }) => {
      const pic = value.participants.find((p) => p.isPic)

      if (!pic || pic.employeeId !== currentEmployeeId) {
        toast.error('You must be the PIC of this proposal.')
        return
      }

      const formData = new FormData()

      formData.append('Destination', value.destination)
      formData.append('StartDate', value.startDate)
      formData.append('EndDate', value.endDate)

      // TotalAmount backend masih digunakan untuk menyimpan
      // Accommodation Amount pada tahap Create.
      formData.append(
        'TotalAmount',
        value.accommodationAmount.toString(),
      )

      formData.append('Description', value.description)

      formData.append(
        'Participants',
        JSON.stringify(
          value.participants.map((participant) => ({
            EmployeeId: participant.employeeId,
            IsPic: participant.isPic,
            Amount: 0,
          })),
        ),
      )

      if (value.file) {
        formData.append('File', value.file)
      }

      try {
        await mutation.mutateAsync(formData)

        toast.success('Trip proposal submitted successfully')

        await navigate({
          to: '/trip-proposals',
        })
      } catch (err: unknown) {
        console.error('CREATE TRIP PROPOSAL ERROR:', err)

        toast.error(
          getFriendlyErrorMessage(
            err,
            'Gagal mengajukan proposal perjalanan',
          ),
        )
      }
    },
  })
}

export const editTripProposalForm = (
  proposalId: string,
  currentEmployeeId: string,
  initialValues: {
    destination: string
    startDate: string
    endDate: string
    accommodationAmount: number
    description: string
    participants: TripProposalParticipantInput[]
  },
) => {
  const mutation = useUpdateTripProposalMutation(proposalId)
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      ...initialValues,
      file: null as File | null,
    },

    validators: {
      onSubmit: editTripProposalSchema,
    },

    onSubmit: async ({ value }) => {
      const pic = value.participants.find((p) => p.isPic)

      if (!pic || pic.employeeId !== currentEmployeeId) {
        toast.error('You must be the PIC of this proposal.')
        return
      }

      const formData = new FormData()

      formData.append('Destination', value.destination)
      formData.append('StartDate', value.startDate)
      formData.append('EndDate', value.endDate)
      formData.append('TotalAmount', value.accommodationAmount.toString())
      formData.append('Description', value.description)
      formData.append(
        'Participants',
        JSON.stringify(
          value.participants.map((participant) => ({
            EmployeeId: participant.employeeId,
            IsPic: participant.isPic,
            Amount: 0,
          })),
        ),
      )

      if (value.file) {
        formData.append('File', value.file)
      }

      try {
        await mutation.mutateAsync(formData)

        toast.success('Trip proposal resubmitted successfully')

        await navigate({
          to: '/trip-proposals/$id',
          params: { id: proposalId },
        })
      } catch (err: unknown) {
        console.error('UPDATE TRIP PROPOSAL ERROR:', err)

        toast.error(
          getFriendlyErrorMessage(
            err,
            'Gagal mengajukan ulang revisi proposal perjalanan',
          ),
        )
      }
    },
  })
}