import { useAppForm } from '#/hooks/app.form'
import { toDateOnly } from '#/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { useCreateClaimMutation } from '../queries/queries'
import { createClaimSchema } from './schemas'

export const createClaimForm = (employeeId: string) => {
  const mutation = useCreateClaimMutation()
  const navigate = useNavigate()
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      employeeId: employeeId,
      claimType: 'Benefit',
      description: '',
      transactionDate: toDateOnly(new Date(today)),
      amount: 0,
      employeeBenefitId: null as string | null,
      tripProposalId: null as string | null,
      receiptFile: null as File | null,
    },
    validators: {
      onBlur: createClaimSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      // Do something with form data
      formData.append('claimType', value.claimType)
      formData.append('description', value.description)
      formData.append('transactionDate', value.transactionDate)
      formData.append('amount', value.amount.toString())
      if (value.employeeBenefitId) {
        formData.append('employeeBenefitId', value.employeeBenefitId)
      }
      if (value.tripProposalId) {
        formData.append('tripProposalId', value.tripProposalId)
      }
      if (value.receiptFile) {
        formData.append('receiptFile', value.receiptFile)
      }

      try {
        mutation.mutate(formData)
        await navigate({
          to: '/claims',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}
