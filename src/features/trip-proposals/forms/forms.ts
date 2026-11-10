import { useAppForm } from '#/hooks/app.form'
import { useNavigate } from '@tanstack/react-router'
import { useCreateTripProposalMutation } from '#/features/trip-proposals/queries/queries'
import { createTripProposalSchema } from './schemas'
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
      console.log('SUBMIT TERPANGGIL')
      console.log('FORM VALUE:', value)

      const pic = value.participants.find((p) => p.isPic)

      if (!pic || pic.employeeId !== currentEmployeeId) {
        toast.error('You must be the PIC of this proposal.')
        return
      }

      const totalAmount = value.participants.reduce(
        (total, participant) => total + participant.amount,
        0,
      )

      const formData = new FormData()

      formData.append('Destination', value.destination)
      formData.append('StartDate', value.startDate)
      formData.append('EndDate', value.endDate)
      formData.append('Description', value.description)
      formData.append('TotalAmount', totalAmount.toString())

      formData.append(
        'Participants',
        JSON.stringify(
          value.participants.map((participant) => ({
            EmployeeId: participant.employeeId,
            IsPic: participant.isPic,
            Amount: participant.amount,
          })),
        ),
      )

      if (value.file) {
        formData.append('File', value.file)
      }

      try {
        console.log('MENGIRIM FORM DATA')

        await mutation.mutateAsync(formData)

        console.log('BERHASIL MENGIRIM DATA')

        toast.success('Trip proposal submitted successfully')

        await navigate({
          to: '/trip-proposals',
        })
      } catch (err: unknown) {
        console.error('CREATE TRIP PROPOSAL ERROR:', err)

        toast.error(getFriendlyErrorMessage(err, 'Gagal mengajukan proposal perjalanan'))
      }
    },
  })
}
